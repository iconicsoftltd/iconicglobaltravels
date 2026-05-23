
export function appendHtmlToDom(html: string) {
    
  const wrapper = document.createElement('div');
  wrapper.innerHTML = html.trim();

  Array.from(wrapper.children).forEach((node) => {
    
    if (node.tagName === 'SCRIPT') {
      const script = document.createElement('script');
      
      Array.from(node.attributes).forEach((a) =>
        script.setAttribute(a.name, a.value),
      );
      script.text = node.innerHTML;
      document.head.appendChild(script);
    } else {
        
      document.body.appendChild(node);
    }
  });
}
