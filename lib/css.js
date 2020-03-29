module.exports = function(data){
  let str_templ = "<style>\n";
  str_templ += data;
  str_templ += "</style>";
  return str_templ;
}