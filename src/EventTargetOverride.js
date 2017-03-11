/**
 * Taken from http://stackoverflow.com/questions/19469881/remove-all-event-listeners-of-specific-type
 */

EventTarget.prototype.addEventListenerBase = EventTarget.prototype.addEventListener;
EventTarget.prototype.addEventListener = function(type, listener)
{
  if(!this.EventList) { this.EventList = []; }
  this.addEventListenerBase.apply(this, arguments);
  if(!this.EventList[type]) { this.EventList[type] = []; }
  var list = this.EventList[type];
  for(var index = 0; index != list.length; index++)
  {
    if(list[index] === listener) { return; }
  }
  list.push(listener);
};

EventTarget.prototype.removeEventListenerBase = EventTarget.prototype.removeEventListener;
EventTarget.prototype.removeEventListener = function(type, listener)
{
  if(!this.EventList) { this.EventList = []; }
  if(listener instanceof Function) { this.removeEventListenerBase.apply(this, arguments); }
  if(!this.EventList[type]) { return; }
  var list = this.EventList[type];
  for(var index = 0; index != list.length;)
  {
    var item = list[index];
    if(!listener)
    {
      this.removeEventListenerBase(type, item);
      list.splice(index, 1); continue;
    }
    else if(item === listener)
    {
      list.splice(index, 1); break;
    }
    index++;
  }
  if(list.length == 0) { delete this.EventList[type]; }
};
