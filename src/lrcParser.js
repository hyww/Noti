
const lrcParser= (lrc) => {
  let parsed = {lyrics:[]};
  lrc.replace(/\s*\[([^\]]+)\](.*)/g, function(a, tag, l){
    if(/\d{2}:\d{2}(\.\d{2})?/.test(tag)) {
      let time;
      tag.replace(/(\d{2}):(\d{2})\.?(\d{2})?/, function(a, m, s, ms){
        time = parseInt(m, 10)*60+parseInt(s, 10);
        if(ms)
          time += parseInt(ms, 10)*0.01;
      });
      parsed.lyrics.push({time, text: l});
    }
    else {
      tag = tag.split(':');
      parsed[tag[0]] = tag[1];
    }
  });
  return parsed;
};

export default lrcParser;
