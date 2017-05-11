import React from 'react';

const Subtitle = (props) => {
  const getText= (l, s, o) => {
    s+= o;
    for( let i = l.length - 1 ; i >= 0 ; i-- ){
      if ( l[i].time <= s )
        return l[i].text===''?'　':l[i].text;
    }
  };
  return (
    <div className="sub">
      {props.sub?getText(props.sub, props.time, props.offset):'　'}
    </div>
  )
}

export default Subtitle;
