/* Rio preservation host integration. GPL-3.0-or-later. No proprietary game code. */
package org.rio;

import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.io.ByteArrayInputStream;
import java.util.zip.ZipInputStream;
import java.util.zip.ZipEntry;
import org.recompile.mobile.Mobile;
import pl.zb3.freej2me.launcher.FilesUtil;

public class HostBridge {
    public static boolean setPaused(boolean paused) throws Exception {
        Object loader = Mobile.getPlatform().loader;
        Field field = loader.getClass().getDeclaredField("mainInst");
        field.setAccessible(true);
        Object midlet = field.get(loader);
        if (midlet == null) return false;
        Class<?> type = midlet.getClass();
        String name = paused ? "pauseApp" : "startApp";
        while (type != null) {
            try {
                Method method = type.getDeclaredMethod(name);
                method.setAccessible(true);
                method.invoke(midlet);
                return true;
            } catch (NoSuchMethodException missing) { type = type.getSuperclass(); }
        }
        return false;
    }
    private static Path rmsPath(String appId) {
        Path root = Paths.get("/files").toAbsolutePath().normalize();
        Path path = root.resolve(appId).resolve("rms").normalize();
        if (!path.startsWith(root) || !appId.matches("rio-[a-zA-Z0-9-]+")) throw new IllegalArgumentException("Invalid app id");
        return path;
    }
    public static byte[] exportRms(String appId) throws Exception {
        Path path = rmsPath(appId);
        Files.createDirectories(path);
        return FilesUtil.zipDirectory(path);
    }
    // Called before starting the MIDlet, never while its RecordStores are open.
    public static void importRms(String appId, byte[] zip) throws Exception {
        Path path = rmsPath(appId);
        if (zip == null || zip.length < 22 || zip[0] != 80 || zip[1] != 75) throw new IllegalArgumentException("Invalid RMS ZIP");
        int count = 0; long expanded = 0;
        try (ZipInputStream input = new ZipInputStream(new ByteArrayInputStream(zip))) {
            ZipEntry entry; byte[] buffer = new byte[8192];
            while ((entry = input.getNextEntry()) != null) {
                String name = entry.getName();
                Path target = path.resolve(name).normalize();
                if (++count > 4096 || !target.startsWith(path) || name.contains("\\") || name.startsWith("/")) throw new IllegalArgumentException("Invalid RMS archive");
                int n; while ((n = input.read(buffer)) != -1) { expanded += n; if (expanded > 8 * 1024 * 1024) throw new IllegalArgumentException("Excessive RMS archive"); }
            }
        }
        Files.createDirectories(path);
        byte[] backup = FilesUtil.zipDirectory(path);
        if (backup == null) throw new IllegalStateException("Cannot back up existing RMS");
        try {
            FilesUtil.emptyDirectory(path.toFile());
            FilesUtil.unzipToDirectory(path.toString(), zip);
        } catch (Exception failure) {
            FilesUtil.emptyDirectory(path.toFile());
            FilesUtil.unzipToDirectory(path.toString(), backup);
            throw failure;
        }
    }
}
