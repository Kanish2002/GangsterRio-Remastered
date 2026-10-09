// Original test fixture, GPL-3.0-or-later. Not a game or substitute game content.
import javax.microedition.midlet.MIDlet;
import javax.microedition.lcdui.*;
import javax.microedition.rms.RecordStore;

public class BridgeProbe extends MIDlet {
  private Probe canvas;
  public void startApp(){if(canvas==null){canvas=new Probe();new Thread(canvas).start();}canvas.active=true;Display.getDisplay(this).setCurrent(canvas);}
  public void pauseApp(){if(canvas!=null)canvas.active=false;}
  public void destroyApp(boolean unconditional){if(canvas!=null)canvas.stop=true;}
  static class Probe extends Canvas implements Runnable {
    volatile boolean active=true,stop=false;int ticks=0,keys=0,saved=0;
    Probe(){setFullScreenMode(true);try{RecordStore rs=RecordStore.openRecordStore("probe",true);if(rs.getNumRecords()>0)saved=rs.getRecord(1)[0]&255;rs.closeRecordStore();}catch(Exception e){throw new RuntimeException(e.toString());}}
    protected void paint(Graphics g){g.setColor((ticks%256)<<16|(keys%256)<<8|saved);g.fillRect(0,0,getWidth(),getHeight());g.setColor(0xffffff);g.drawString("Original host test fixture",10,20,Graphics.TOP|Graphics.LEFT);}
    public void keyPressed(int key){keys++;if(key==KEY_NUM5){saved++;try{RecordStore rs=RecordStore.openRecordStore("probe",true);byte[] data={(byte)saved};if(rs.getNumRecords()==0)rs.addRecord(data,0,1);else rs.setRecord(1,data,0,1);rs.closeRecordStore();}catch(Exception e){throw new RuntimeException(e.toString());}}repaint();}
    public void run(){while(!stop){if(active){ticks++;repaint();serviceRepaints();}try{Thread.sleep(50);}catch(Exception ignored){}}}
  }
}
