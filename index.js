var stream = require('stream')
var util = require('util');

var pasteur = require("compt")._;

var Transform = stream.Transform ||
  require('readable-stream').Transform;


function script_composer(command,interpolation){
    
    
     Transform.call(this, {objectMode: true});
     this._destroyed = false
     this._lastLineData ='';
     this._command = command;
     this._interpolation = interpolation;
}
util.inherits(script_composer, Transform);
script_composer.prototype._destroy = function (chunk, enc, cb) {
   // this.cork();
  
   
  
};
script_composer.prototype.destroy = function (err) {
  // this.cork();
  
  if (this._destroyed) return
  this._destroyed = true
  
    var self = this
    process.nextTick(function() {
      if (err)
        self.emit('error', err)
      self.emit('close')
    })
};

script_composer.prototype._transform = function(chunk, enc, done){

    var data = chunk.toString()

    if (this._lastLineData) data = this._lastLineData + data
    var clean_lines = [];
  
 
    if(pasteur.getTypeof(this._interpolation) == "json"){
      if(pasteur.has(this._interpolation,"data")){
        data = pasteur.template_value(data,this._interpolation["data"]);
      }


      if(pasteur.has(this._interpolation,"banner")){
        if(pasteur.has(this._interpolation["banner"],"header")){
            if(parseInt(this._command['count']) ==0){
              
              
             
             data = this._interpolation["banner"]['header']+data
             
            
            }
        }

        if(pasteur.has(this._interpolation["banner"],"footer")){
          if(parseInt(this._command['count']) == parseInt(this._command['count_file_read']) -1){
            data = data+this._interpolation["banner"]['footer']
          }
        }
      }

      
     
    }
    clean_lines.push(data);
    clean_lines.forEach(this.push.bind(this))
    done()
  
}

exports.grass_stream_config=function(){
    this.setDefaultExtension(['__any__'])
}
exports.grasseum_command = function(option1){
    console.log("grasseum_command");
}


  

exports.grass_stream_transform = function(command,inter){
  
    var mindf = new script_composer(command,inter)
    

    return mindf
 
}