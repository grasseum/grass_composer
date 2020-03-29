module.exports = function(data){
  let str_templ = '<script type="text/javascript">\n';
  str_templ += data;
  str_templ += "</script>";
  return str_templ;
}