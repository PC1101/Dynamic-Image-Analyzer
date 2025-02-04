javascript:(function() {
  const getChatContext = (imgElement) => {
    // Find the message container hierarchy
    const messageContainer = imgElement.closest('[role="row"], [role="listitem"], [data-tooltip-content]');
    
    // Extract text from 3 previous messages and 2 next messages
    const contextMessages = [];
    let currentElement = messageContainer;

    // Scan backwards
    for (let i = 0; i < 3; i++) {
      currentElement = currentElement?.previousElementSibling;
      const text = currentElement?.querySelector?.('[aria-label^="Message"], [data-text]')?.innerText;
      if (text) contextMessages.unshift(text);
    }

    // Reset and scan forwards
    currentElement = messageContainer;
    for (let i = 0; i < 2; i++) {
      currentElement = currentElement?.nextElementSibling;
      const text = currentElement?.querySelector?.('[aria-label^="Message"], [data-text]')?.innerText;
      if (text) contextMessages.push(text);
    }

    return contextMessages.join('\n');
  };

  const processImage = async (img) => {
    if (!img.src.startsWith('blob:')) return;
    
    // Get dynamic context from surrounding messages
    const chatContext = getChatContext(img);
    
    try {
      const response = await fetch('http://localhost:3103/api/gpt-4-vision', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          imageUrl: img.src,
          context: chatContext || "No text context available"
        })
      });
      
      const analysis = await response.json();
      console.log('GPT-4 Analysis:', analysis);
    } catch (error) {
      console.error('API Error:', error);
    }
  };

  // Mutation Observer configuration
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        const images = node.querySelectorAll?.('img[src^="blob:https://www.messenger.com"]');
        images?.forEach(processImage);
      });
    });
    alert('123');
  });
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });


  alert('Dynamic Vision Analyzer Activated!');
})();
