import org.rio.HostBridge;
import java.nio.file.*;
import java.util.*;
import java.io.*;
import java.util.zip.*;
import pl.zb3.freej2me.launcher.FilesUtil;

public class RmsBridgeTest {
  private static byte[] archive(String name, byte[] data) throws Exception {
    ByteArrayOutputStream bytes=new ByteArrayOutputStream();
    try(ZipOutputStream out=new ZipOutputStream(bytes)){out.putNextEntry(new ZipEntry(name));out.write(data);out.closeEntry();}
    return bytes.toByteArray();
  }
  public static void main(String[] args) throws Exception {
    String id="rio-test-"+UUID.randomUUID();Path root=Paths.get("/files",id),rms=root.resolve("rms");
    Files.createDirectories(rms);byte[] record={1,2,3,4,5};Files.write(rms.resolve("checkpoint"),record);
    try {
      byte[] exported=HostBridge.exportRms(id);Files.write(rms.resolve("checkpoint"),new byte[]{9});
      HostBridge.importRms(id,exported);
      if(!Arrays.equals(record,Files.readAllBytes(rms.resolve("checkpoint"))))throw new AssertionError("Record roundtrip mismatch");
      for(byte[] invalid:new byte[][]{new byte[]{1,2,3},archive("../escape",record),archive("huge",new byte[8*1024*1024+1])}) {
        try{HostBridge.importRms(id,invalid);throw new AssertionError("Invalid archive accepted");}catch(IllegalArgumentException expected){}
        if(!Arrays.equals(record,Files.readAllBytes(rms.resolve("checkpoint"))))throw new AssertionError("Rejected import changed records");
      }
      try{HostBridge.exportRms("../outside");throw new AssertionError("Invalid ID accepted");}catch(IllegalArgumentException expected){}
      System.out.println("RMS bridge: roundtrip, traversal, expansion and rejected-import preservation passed");
    } finally {FilesUtil.emptyDirectory(root.toFile());Files.deleteIfExists(root);}
  }
}
