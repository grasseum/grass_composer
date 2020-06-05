const stream = require('stream')
const util = require('util');

const compt = require("compts")._;

const Transform = stream.Transform ||
  require('readable-stream').Transform;

 // const read_file = require("grasseum_directory/read_file");
 // const write_file = require("grasseum_directory/write_file");
  const configlib = require("grass_composer/configlib")



function script_composer(interpolation){
    
  
     Transform.call(this, {objectMode: true});
     this._destroyed = false
     this._lastLineData ='';
     this._command = {
       "is_completed_done":false,
       "count":0,
       "count_file_read":0
     };
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

script_composer.prototype.complete = function(clean_lines,data,done){
  clean_lines.push(data);
   clean_lines.forEach(this.push.bind(this))
   done()
}
script_composer.prototype._transform = function(chunk, enc, done){

    var data = chunk['contents']

    if (this._lastLineData) data = this._lastLineData + data
    var clean_lines = [];
  
    this._command['is_completed_done'] = true;

    if(compt.getTypeof(this._interpolation) == "json"){
    
      if(compt.has(this._interpolation,"data")){
        
        data = compt.templateValue(data,this._interpolation["data"]);
        
      }


      if(compt.has(this._interpolation,"banner")){
        if(compt.has(this._interpolation["banner"],"header")){

            if(parseInt(this._command['count']) ==0){

             data = this._interpolation["banner"]['header']+data

            }
        }

        if(compt.has(this._interpolation["banner"],"footer")){
          if(parseInt(this._command['count']) == parseInt(this._command['count_file_read']) -1){
            data = data+this._interpolation["banner"]['footer']
          }
        }
      }
      if(compt.has(this._interpolation,"directory_replace_content")  ){
        this._command['is_completed_done'] = false;
        let target_config_regexp = configlib.regexp_default_tag_name();
        
        let data_content = configlib.get_list_tag_resources(data,this._interpolation)
        let main = this;
        setTimeout(function(){
          
          let data_content_file = data.replace(target_config_regexp , function(match,target_str,offset){
              if(compt.has(data_content,target_str)){
                return data_content[target_str];
              }
          });
   
          data = data_content_file
          chunk['content'] = data
          main.complete(clean_lines,chunk,done)
        },500)
      

       
      }

      
     
    }
   
    if (this._command['is_completed_done']){
      chunk['contents'] = data
      this.complete(clean_lines,chunk,done)
    }
    
  
}


  

module.exports = function( inter){

    var mindf = new script_composer( inter)
    

    return mindf
 
}