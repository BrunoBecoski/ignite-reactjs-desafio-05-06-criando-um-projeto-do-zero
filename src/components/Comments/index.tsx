import { useEffect } from 'react';
import styles from './comments.module.scss';

export default function Comments() {

  useEffect(() => {
    let script = document.createElement("script");
    let anchor = document.getElementById("inject-comments-for-uterances");
    script.setAttribute("src", "https://utteranc.es/client.js");
    script.setAttribute("crossorigin", "anonymous");
    script.setAttribute("async", true);
    script.setAttribute("repo", "BrunoBecoski/ignite_reactjs-desafio-05-06-criando-um-projeto-do-zero");
    script.setAttribute("issue-term", "pathname");
    script.setAttribute("theme", "photon-dark");
    anchor.appendChild(script);
  }, [])

  return (
    <div id="inject-comments-for-uterances" className={styles.container}/>
  )
}
