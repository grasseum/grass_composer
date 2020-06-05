let lib_css = require("grass_composer/lib/css");
let lib_js = require("grass_composer/lib/js")
let lib_error = require("grass_composer/lib/error")
let lib_html = require("grass_composer/lib/html")

let read_file = require("grasseum_directory/read_file");
var compt = require("compts")._;
let path = require("path");
exports.type_lib = function(){
    return {
        "css":lib_css,
        "js":lib_js,
        "error":lib_error,
        "html":lib_html,
    }
};

exports.regexp_default_tag_name = function(){
    let target_config = "\\[%([\\s\\S]+?)%\\]";
    let target_config_regexp = new RegExp( target_config,"g" )
    return target_config_regexp;
}

exports.get_list_tag_resources = function(data,controls){
    let target_config_regexp = exports.regexp_default_tag_name();
    let data_reference_tag = {};        
     data.replace(target_config_regexp , function(match,target_str,offset){
        let param_data = {};
        let local_target_config = target_str.split(/(\; )/g);
          local_target_config.forEach(function(k,v){
            let split_req = k.split("=");

            if( split_req.length >=2 ){
              let split_req_key = split_req[0].trim();
              let split_req_value = split_req[1].trim();
              param_data[split_req_key] = split_req_value;
            }

          });
          let ref_type = compt.varExtend({ "type": 'error' },param_data); 
          let ref_type_str = ref_type['type'].replace(/["']/g,"").trim();
          
          if(compt.has(exports.type_lib(),ref_type_str) && compt.has( param_data,"src" )){
          
            let param_data_src = param_data['src'].replace(/["']/g,"").trim();
            
            let join_path_src = path.join(controls['directory_replace_content'] ,param_data_src );


            read_file.read_file_ut8(join_path_src ,function(res){
                   
                if(res.is_file_exists){
                    data_reference_tag[target_str] = exports.type_lib()[ref_type_str].call(this, res.data )
                }else{
                    console.log("File name:"  + join_path_src+" is does not exists, please check this file");
                    data_reference_tag[target_str] = "";
                }
               
            });


        
            
          }    
    })

    return data_reference_tag
}    