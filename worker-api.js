addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request))
  })
  
  async function handleRequest(request) {
    const { method, url } = request
    const { pathname, searchParams } = new URL(url)
  
    if (method === 'POST' && pathname.startsWith('/webhook')) {
      // Extract the message from the request
      const body = await request.json()
      const message = body.message
  
      // Process the message and generate a response
      const response = await generateResponse(message)
  
      // Send the response back to Telegram
      await sendTelegramMessage(message.chatId, response)
  
      return new Response('', { status: 200 })
    }
  
    return new Response('Not Found', { status: 404 })
  }
  
  async function generateResponse(message) {
    // Extract the search query from the user's message
    const searchQuery = message.text
  
    // Search Google using the Custom Search JSON API
    const searchResults = await searchGoogle(searchQuery)
  
    // Extract SERP information (title, URL, meta description) from the search results
    const serpInfo = extractSERPInfo(searchResults)
  
    // Format the SERP information for response
    let response = 'Search Engine Results Page (SERP):\n\n'
    serpInfo.forEach(result => {
      response += `Title: ${result.title}\nURL: ${result.url}\nMeta Description: ${result.metaDescription}\n\n`
    })
  
    return response
  }
  
  async function searchGoogle(query) {
    const apiKey = 'YOUR_GOOGLE_CUSTOM_SEARCH_API_KEY'
    const searchEngineId = 'YOUR_GOOGLE_CUSTOM_SEARCH_ENGINE_ID'
    const endpoint = `https://www.googleapis.com/customsearch/v1?q=${query}&key=${apiKey}&cx=${searchEngineId}`
    const response = await fetch(endpoint)
    return await response.json()
  }
  
  function extractSERPInfo(searchResults) {
    const items = searchResults.items || []
    return items.map(item => ({
      title: item.title,
      url: item.link,
      metaDescription: item.snippet
    }))
  }
  
  async function sendTelegramMessage(chatId, text) {
    const token = 'YOUR_TELEGRAM_BOT_TOKEN'
    const url = `https://api.telegram.org/bot${token}/sendMessage`
    const body = {
      chat_id: chatId,
      text: text
    }
    await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })
  }
  