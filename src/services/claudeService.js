export async function getAIFeedback(idea) {
  const apiKey = import.meta.env.VITE_CLAUDE_API_KEY

  if (!apiKey) {
    return `**Key Strengths**
- Clear student pain point with a relatable day-to-day workflow.
- The concept is narrow enough to prototype quickly on campus.

**Key Risks**
- Retention may drop if students only use it during high-pressure weeks.
- The current solution needs a sharper moat beyond accountability reminders.

**Target Market**
The strongest initial audience is college students in exam-heavy programs who already study in groups, use Discord or WhatsApp for accountability, and are open to structured productivity tools.

**Actionable Next Step**
Run a 7-day pilot with 10 students and track repeat session completion before building more features.`
  }

  const systemPrompt = "You are an experienced startup mentor reviewing a student's startup idea. Provide structured feedback with exactly these 4 sections: **Key Strengths** (2-3 bullet points), **Key Risks** (2-3 bullet points), **Target Market** (1 paragraph), **Actionable Next Step** (1 clear recommendation). Be honest, concise, and encouraging."

  const userPrompt = `Idea Title: ${idea.title}\nProblem: ${idea.problem}\nSolution: ${idea.solution}\nStage: ${idea.stage}\nTags: ${(idea.tags ?? []).join(', ')}`

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      system_instruction: {
        parts: [{ text: systemPrompt }]
      },
      contents: [{
        parts: [{ text: userPrompt }]
      }],
      generationConfig: {
        maxOutputTokens: 1000,
      }
    }),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    const errorMessage = errorData.error?.message || ''

    // show fake feedback if api fails
    if (errorMessage.includes('denied access') || errorMessage.includes('PERMISSION_DENIED') || response.status === 403 || response.status === 404) {
      return `**Key Strengths**
- You have identified a very clear and relatable user pain point.
- The concept is highly focused and perfectly suited for rapid prototyping and testing.

**Key Risks**
- User retention might drop significantly if the core feature doesn't evolve into a daily habit.
- You must carefully differentiate this product from existing alternatives in the current market.

**Target Market**
Your ideal initial users are highly active early adopters who actively seek out productivity upgrades and are open to early-stage software.

**Actionable Next Step**
Locate 5 potential users who struggle with this problem and run a manual test with them before writing any more complex code.`
    }

    throw new Error(errorMessage || 'AI feedback request failed.')
  }

  const data = await response.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
}

export async function generateChatReply(contactName, contactRole, userMessage) {
  const apiKey = import.meta.env.VITE_CLAUDE_API_KEY
  
  const fallbacks = [
    "That sounds great! Let's build it.",
    "Interesting! I'd love to hear more details.",
    "I completely agree. When are you free to hop on a call?",
    "Haha yeah, makes sense. What's the next step?",
    "Sure thing! Let me take a look at it.",
  ]
  const randomFallback = fallbacks[Math.floor(Math.random() * fallbacks.length)]

  if (!apiKey) return randomFallback

  const systemPrompt = `You are ${contactName}, a student and ${contactRole} chatting on a builder platform. You are replying to a direct message from another student trying to collaborate with you. Keep your response very casual, short (1-2 sentences max), human-like, exactly like a WhatsApp or Instagram message. Don't be formal.`
  
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: [{ parts: [{ text: userMessage }] }],
        generationConfig: { maxOutputTokens: 150, temperature: 0.7 }
      }),
    })

    if (!response.ok) return randomFallback

    const data = await response.json()
    return data.candidates?.[0]?.content?.parts?.[0]?.text ?? randomFallback
  } catch (err) {
    return randomFallback
  }
}