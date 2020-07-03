const compt = require("compts")._;


const configlib = require("grass_composer/configlib")

var grasseum_util =require("grasseum_util")  
var trasform_stream = grasseum_util.stream().trasform;

function script_composer(interpolation){
    
      this._destroyed = false
     this._lastLineData ='';
     this._command = {
       "is_completed_done":false,
       "count":0,
       "count_file_read":0
     };
     this._interpolation = interpolation;
}

 
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

script_composer.prototype.complete = function(clean_lines,data,done,self){
  clean_lines.push(data);
   clean_lines.forEach(self.push.bind(self))
   done()
}
script_composer.prototype.transform = function(action){
var self = this;

  var clean_lines = [];
    if(action.data.isGrasseumPlatform()){
      var data = action.data['contents'].toString();

      if (this._lastLineData) data = this._lastLineData + data
     
    
      this._command['is_completed_done'] = true;

      if(compt.getTypeof(this._interpolation) == "json"){
      
        if(compt.has(this._interpolation,"data")){

          data = compt.templateValue(data,this._interpolation["data"]);
           
        }


        if(compt.has(this._interpolation,"banner")){
          if(action.data.isFirstPath){

              if(parseInt(this._command['count']) ==0){

              data = this._interpolation["banner"]['header']+data

              }
          }
          
          if(compt.has(this._interpolation["banner"],"footer")){
            if( action.data.isLastPath ){
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
        
           data =data_content_file;
           action.data['contents'] = new Buffer(data);
           main.complete(clean_lines,action.data,action.callback,action.self)
            return
          },500)
        

        
        }

        
      
      }
    
      if (this._command['is_completed_done']){
        action.data['contents'] = new Buffer(data);
        this.complete(clean_lines,action.data,action.callback,action.self)
        return
      }
    }else{
      console.log("This module is compatible only to grasseum");
      this.complete(clean_lines,action.data,action.callback,action.self)
      return
    }  
    
}


  

module.exports = function( inter){

    var mindf = new script_composer( inter)
    

    return trasform_stream(mindf)
 
}