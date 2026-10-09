// Serialized Java event dispatch. GPL-3.0-or-later.
export class EventQueue {
  queue=[];waiter=null;
  queueEvent(evt,duplicate) {
    if(duplicate&&this.queue.some(duplicate))return;
    this.queue.push(evt);
    if(this.waiter){const wake=this.waiter;this.waiter=null;wake();}
  }
  async waitForEvent() {
    while(!this.queue.length)await new Promise(resolve=>this.waiter=resolve);
    return this.queue.shift();
  }
}
