// Global state
let userId = null;
let conversationId = null;
let isWaitingForResponse = false;
let authToken = null;

// API base URL
const API_BASE = window.location.origin;
// No frontend redirects - backend is standalone

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DOM Content Loaded');
    console.log('📍 Current URL:', window.location.href);
    console.log('📍 Current search params:', window.location.search);
    
    // Check for Auth0 callback (token, userId, or user info in URL)
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const userIdParam = urlParams.get('userId');
    const userParam = urlParams.get('user');
    
    console.log('🔍 URL Parameters found:');
    console.log('  - token:', token ? 'YES (length: ' + token.length + ')' : 'NO');
    console.log('  - userId:', userIdParam || 'NO');
    console.log('  - user:', userParam ? 'YES' : 'NO');
    
    if (userIdParam) {
        console.log('✅✅✅ UserId found in URL:', userIdParam);
        // User is authenticated - keep modal hidden
        
        // Clear redirect flag since we successfully got userId
        sessionStorage.removeItem('redirectingToAuth');
        
        // UserId passed directly - user already registered in FastAPI
        userId = parseInt(userIdParam);
        if (isNaN(userId)) {
            console.error('❌ Invalid userId:', userIdParam);
            // Redirect to frontend for authentication
            console.log('Redirecting to frontend for authentication');
            createAnonymousSession();
            return;
        }
        console.log('✅ Parsed userId as number:', userId);
        localStorage.setItem('userId', userId.toString());
        console.log('✅ UserId stored in localStorage:', userId);
        
        // Clean URL immediately to prevent re-reading
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
        console.log('✅ URL cleaned, new URL:', cleanUrl);
        
        // Small delay to ensure DOM is ready, then load profile and enable chat
        setTimeout(() => {
            console.log('✅ Loading user profile and enabling chat...');
            loadUserProfile(userId);
            console.log('✅✅✅ Profile loading initiated!');
        }, 100);
    } else if (token) {
        console.log('Token found in URL, length:', token.length);
        // Token passed from Auth0 callback - user is authenticated
        authToken = decodeURIComponent(token); // Decode in case it was encoded
        localStorage.setItem('authToken', authToken);
        console.log('Token stored, calling initializeUser...');
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);
        initializeUser();
    } else if (userParam) {
        console.log('User info found in URL, creating session...');
        // User info passed (fallback when token not available) - user is authenticated
        try {
            const userInfo = JSON.parse(decodeURIComponent(userParam));
            console.log('User info:', userInfo);
            // Call FastAPI to create user and get a session
            createUserSession(userInfo);
        } catch (e) {
            console.error('Error parsing user info:', e);
            // Redirect to frontend for authentication
            console.log('Redirecting to frontend for authentication');
            createAnonymousSession();
        }
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);
    } else {
        console.log('No token, userId, or user in URL, checking localStorage...');
        // Check if already logged in
        const storedUserId = localStorage.getItem('userId');
        if (storedUserId) {
            console.log('✅ UserId found in localStorage:', storedUserId);
            userId = parseInt(storedUserId);
            if (isNaN(userId)) {
                console.error('❌ Invalid userId in localStorage:', storedUserId);
                localStorage.removeItem('userId');
                // Redirect to frontend for authentication
                console.log('Redirecting to frontend for authentication');
                createAnonymousSession();
            } else {
                // User is authenticated - load profile and enable chat
                loadUserProfile(userId);
            }
        } else {
            authToken = localStorage.getItem('authToken');
            if (authToken) {
                console.log('Token found in localStorage, calling initializeUser...');
                // User has token - initialize user session
                initializeUser();
            } else {
                // No authentication - create anonymous session for direct access
                console.log('⚠️ No authentication found - creating anonymous session');
                console.log('💡 Users can access chatbot directly without authentication');
                
                // Create anonymous user session
                createAnonymousSession();
            }
        }
    }
    
    // Chat input handler
    const chatInput = document.getElementById('chatInput');
    const sendButton = document.getElementById('sendButton');
    
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey && !isWaitingForResponse) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    sendButton.addEventListener('click', sendMessage);
});

// Login modal removed - backend only accessible after frontend authentication
// All unauthenticated users are redirected to frontend
// No redirects - backend is standalone
function redirectToFrontend() {
    // Don't redirect - create anonymous session instead
    console.log('No authentication - creating anonymous session');
    createAnonymousSession();
}

function handleLogin() {
    // No login needed - backend is standalone
    // Create anonymous session instead
    console.log('🔐 Creating anonymous session for direct access');
    createAnonymousSession();
}

async function createAnonymousSession() {
    try {
        console.log('👤 Creating anonymous session...');
        // Call backend to create anonymous user
        const response = await fetch(`${API_BASE}/api/user/anonymous`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        
        if (response.ok) {
            const userData = await response.json();
            console.log('✅ Anonymous user created:', userData);
            userId = userData.user_id;
            localStorage.setItem('userId', userId.toString());
            
            // Enable chat without profile (anonymous user)
            enableChat();
            updateWelcomeMessage('Guest');
            console.log('✅ Chat enabled for anonymous user');
        } else {
            console.error('Failed to create anonymous user, using default userId');
            // Fallback: use userId 1 (assuming it exists or will be created)
            userId = 1;
            localStorage.setItem('userId', '1');
            enableChat();
            updateWelcomeMessage('Guest');
        }
    } catch (error) {
        console.error('Error creating anonymous session:', error);
        // Fallback: use default userId
        userId = 1;
        localStorage.setItem('userId', '1');
        enableChat();
        updateWelcomeMessage('Guest');
    }
}

async function createUserSession(userInfo) {
    try {
        console.log('Creating user session with info:', userInfo);
        // Call FastAPI to create/update user and return user_id
        const response = await fetch(`${API_BASE}/api/auth/callback`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                sub: userInfo.sub,
                name: userInfo.name,
                email: userInfo.email
            })
        });
        
        if (!response.ok) {
            const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
            console.error('Failed to create user session:', error);
            createAnonymousSession();
            return;
        }
        
        const userData = await response.json();
        console.log('User session created:', userData);
        
        userId = userData.user_id;
        localStorage.setItem('userId', userId);
        
        // Modal removed - user authenticated
        displayUserProfile(userData);
        enableChat();
        
        // Update welcome message with personalized greeting
        updateWelcomeMessage(userData.name);
    } catch (error) {
        console.error('Error creating user session:', error);
        redirectToFrontend();
    }
}

async function initializeUser() {
    try {
        console.log('Initializing user with token:', authToken ? 'Token present' : 'No token');
        
        if (!authToken) {
            console.error('No auth token available');
            createAnonymousSession();
            return;
        }
        
        // Verify token and get user info
        console.log('Calling /api/user/me with token');
        const response = await fetch(`${API_BASE}/api/user/me`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
            console.error('API error response:', {
                status: response.status,
                statusText: response.statusText,
                error: errorData
            });
            
            if (response.status === 401) {
                // Token expired or invalid
                console.error('Token is invalid or expired - clearing and showing login');
                localStorage.removeItem('authToken');
                authToken = null;
                createAnonymousSession();
                return;
            }
            
            if (response.status === 404) {
                // User not found - this shouldn't happen now but handle it
                console.error('User not found in database');
                localStorage.removeItem('authToken');
                authToken = null;
                createAnonymousSession();
                return;
            }
            
            // Other errors
            console.error('Unexpected error:', errorData);
            alert(`Authentication error: ${errorData.detail || response.statusText}. Please try logging in again.`);
            localStorage.removeItem('authToken');
            authToken = null;
            createAnonymousSession();
            return;
        }
        
        const userData = await response.json();
        console.log('User data received:', userData);
        
        userId = userData.user_id;
        localStorage.setItem('userId', userId);
        
        // Modal removed - user authenticated
        displayUserProfile(userData);
        enableChat();
        
        // Update welcome message with personalized greeting
        updateWelcomeMessage(userData.name);
    } catch (error) {
        console.error('Error initializing user:', error);
        localStorage.removeItem('authToken');
        authToken = null;
        showLoginModal();
    }
}

async function loadUserProfile(userId) {
    console.log('📥 Loading user profile for userId:', userId);
    try {
        const response = await fetch(`${API_BASE}/api/user/${userId}`);
        console.log('📡 API response status:', response.status);
        if (response.ok) {
            const userData = await response.json();
            console.log('✅ User data received:', userData);
            displayUserProfile(userData);
            updateWelcomeMessage(userData.name);
            enableChat();
        } else {
            const errorText = await response.text();
            console.error('❌ Failed to load user profile:', response.status, errorText);
            createAnonymousSession();
        }
    } catch (error) {
        console.error('❌ Error loading user profile:', error);
        redirectToFrontend();
    }
}

function displayUserProfile(userData) {
    console.log('🎨 Displaying user profile:', userData);
    const userProfile = document.getElementById('userProfile');
    const userName = document.getElementById('userName');
    const userEmail = document.getElementById('userEmail');
    const userInitials = document.getElementById('userInitials');
    
    if (!userProfile) {
        console.error('❌ userProfile element not found');
        return;
    }
    if (!userName) {
        console.error('❌ userName element not found');
        return;
    }
    if (!userEmail) {
        console.error('❌ userEmail element not found');
        return;
    }
    if (!userInitials) {
        console.error('❌ userInitials element not found');
        return;
    }
    
    userName.textContent = userData.name || 'User';
    userEmail.textContent = userData.email || '';
    
    // Generate initials from name
    const initials = (userData.name || 'U')
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
    userInitials.textContent = initials;
    
    // Use class instead of inline style for better CSS control
    userProfile.style.display = 'flex';
    userProfile.classList.add('show');
    console.log('✅ User profile displayed');
}

function updateWelcomeMessage(userName) {
    console.log('💬 Updating welcome message for:', userName);
    const welcomeMessage = document.getElementById('welcomeMessage');
    if (welcomeMessage) {
        const name = userName || 'there';
        welcomeMessage.innerHTML = `<p>Hi ${name}! How can I help you today?</p>`;
        console.log('✅ Welcome message updated');
    } else {
        console.error('❌ welcomeMessage element not found');
    }
}

function enableChat() {
    // Allow chat even without userId (for anonymous users)
    // If userId is missing, try to create anonymous session
    if (!userId || userId === null || userId === undefined) {
        console.log('⚠️ No userId found, creating anonymous session...');
        createAnonymousSession();
        return;
    }
    
    const chatInputContainer = document.getElementById('chatInputContainer');
    const chatInput = document.getElementById('chatInput');
    const sendButton = document.getElementById('sendButton');
    
    if (!chatInputContainer || !chatInput || !sendButton) {
        return;
    }
    
    chatInputContainer.style.display = 'block';
    chatInput.disabled = false;
    sendButton.disabled = false;
    chatInput.focus();
}


async function sendMessage() {
    const chatInput = document.getElementById('chatInput');
    const message = chatInput.value.trim();
    
    if (!message || isWaitingForResponse || !userId) {
        if (!userId) {
            createAnonymousSession();
        }
        return;
    }
    
    // Clear input
    chatInput.value = '';
    
    // Add user message to chat
    addMessage('user', message);
    
    // Remove thinking indicator - we'll use streaming instead
    // Disable input while waiting
    isWaitingForResponse = true;
    chatInput.disabled = true;
    document.getElementById('sendButton').disabled = true;
    
    // Hide escalation notice
    document.getElementById('escalationNotice').style.display = 'none';
    
    // Create assistant message container for streaming
    const assistantMessageId = addMessage('assistant', '', 'streaming');
    const assistantMessageEl = document.getElementById(assistantMessageId);
    
    try {
        const requestBody = {
            user_id: String(userId),
            message: message
        };
        
        if (conversationId) {
            requestBody.conversation_id = conversationId;
        }
        
        // Use streaming endpoint
        const headers = {
            'Content-Type': 'application/json'
        };
        
        // Add Authorization header only if token is available
        if (authToken) {
            headers['Authorization'] = `Bearer ${authToken}`;
        }
        
        const response = await fetch(`${API_BASE}/api/chat/stream`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                // Authentication error
                console.error('Authentication failed, showing login');
                localStorage.removeItem('authToken');
                localStorage.removeItem('userId');
                authToken = null;
                userId = null;
                createAnonymousSession();
                return;
            }
            const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
            console.error('Chat error:', errorData);
            throw new Error(errorData.detail || 'Failed to get response');
        }
        
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let fullResponse = '';
        
        while (true) {
            const { done, value } = await reader.read();
            
            if (done) break;
            
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || ''; // Keep incomplete line in buffer
            
            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    try {
                        const data = JSON.parse(line.slice(6));
                        
                        if (data.error) {
                            throw new Error('Streaming error occurred');
                        }
                        
                        if (data.chunk) {
                            fullResponse += data.chunk;
                            // Update message with markdown rendering
                            updateStreamingMessage(assistantMessageId, fullResponse);
                        }
                        
                        if (data.done) {
                            // Update conversation ID
                            if (data.conversation_id) {
                                conversationId = data.conversation_id;
                            }
                            
                            // Show escalation notice if needed
                            if (data.escalate) {
                                showEscalationNotice(data.escalation_type);
                            }
                            
                            // Remove streaming class
                            assistantMessageEl.classList.remove('streaming');
                        }
                    } catch (e) {
                        console.error('Error parsing SSE data:', e);
                    }
                }
            }
        }
        
    } catch (error) {
        console.error('Chat error:', error);
        removeMessage(assistantMessageId);
        addMessage('assistant', 'I apologize, but I encountered an error. Please try again.');
    } finally {
        // Re-enable input
        isWaitingForResponse = false;
        chatInput.disabled = false;
        document.getElementById('sendButton').disabled = false;
        chatInput.focus();
    }
}

function updateStreamingMessage(messageId, content) {
    const messageEl = document.getElementById(messageId);
    if (messageEl) {
        // Render markdown content
        messageEl.innerHTML = renderMarkdown(content);
        scrollToBottom();
    }
}

function renderMarkdown(text) {
    if (!text) return '';
    
    let html = text;
    
    // Escape HTML first (but preserve existing tags from streaming)
    const hasTags = /<[^>]+>/.test(html);
    if (!hasTags) {
        html = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
    
    // Headers (must be before other processing)
    html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');
    
    // Bold (**text** or __text__)
    html = html.replace(/\*\*([^*]+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/__([^_]+?)__/g, '<strong>$1</strong>');
    
    // Process lists - handle bullet points
    const lines = html.split('\n');
    let inList = false;
    let inOrderedList = false;
    const processedLines = [];
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const bulletMatch = line.match(/^[-*]\s+(.+)$/);
        const orderedMatch = line.match(/^\d+\.\s+(.+)$/);
        
        if (bulletMatch) {
            if (!inList) {
                if (inOrderedList) {
                    processedLines.push('</ol>');
                    inOrderedList = false;
                }
                processedLines.push('<ul>');
                inList = true;
            }
            processedLines.push(`<li>${bulletMatch[1]}</li>`);
        } else if (orderedMatch) {
            if (!inOrderedList) {
                if (inList) {
                    processedLines.push('</ul>');
                    inList = false;
                }
                processedLines.push('<ol>');
                inOrderedList = true;
            }
            processedLines.push(`<li>${orderedMatch[1]}</li>`);
        } else {
            if (inList) {
                processedLines.push('</ul>');
                inList = false;
            }
            if (inOrderedList) {
                processedLines.push('</ol>');
                inOrderedList = false;
            }
            processedLines.push(line);
        }
    }
    
    // Close any open lists
    if (inList) processedLines.push('</ul>');
    if (inOrderedList) processedLines.push('</ol>');
    
    html = processedLines.join('\n');
    
    // Split into paragraphs (double newline)
    html = html.split(/\n\n+/).map(para => {
        para = para.trim();
        if (!para) return '';
        
        // Don't wrap headers, lists, or existing paragraphs in <p>
        if (para.match(/^<[hulol]/) || para.startsWith('<p>')) {
            return para;
        }
        
        return `<p>${para}</p>`;
    }).join('');
    
    // Single line breaks within paragraphs
    html = html.replace(/(<p>.*?<\/p>)/gs, (match) => {
        return match.replace(/\n/g, '<br>');
    });
    
    // Clean up
    html = html.replace(/<p><\/p>/g, '');
    html = html.replace(/<p>\s*<\/p>/g, '');
    
    return html;
}

function showEscalationNotice(escalationType) {
    const noticeEl = document.getElementById('escalationNotice');
    const noticeP = noticeEl.querySelector('p');
    
    const messages = {
        'DANGER': '<strong>Immediate Safety Concern</strong><br>Your message has been escalated for immediate safety concerns. Please contact <strong>911</strong> or the <strong>National Suicide Prevention Lifeline at 988</strong> if you need immediate help.',
        'ABUSE': '<strong>Support Available</strong><br>Your message has been escalated. Please contact the <strong>National Domestic Violence Hotline at 1-800-799-7233</strong> for confidential support and resources.',
        'SENSITIVE': '<strong>Expert Support</strong><br>Your question has been escalated to ensure you get the best support. A specialist will contact you shortly.'
    };
    
    noticeP.innerHTML = messages[escalationType] || 'Your question has been escalated to a human expert. They will contact you shortly.';
    noticeEl.style.display = 'block';
}

function addMessage(role, content, className = '') {
    const messagesContainer = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    const messageId = 'msg-' + Date.now() + '-' + Math.random();
    messageDiv.id = messageId;
    messageDiv.className = `message ${role} ${className}`;
    
    // Check if content contains HTML (from markdown rendering)
    if (className === 'streaming' || content.includes('<')) {
        messageDiv.innerHTML = content || '';
    } else {
        // Render markdown for non-streaming messages
        messageDiv.innerHTML = renderMarkdown(content);
    }
    
    messagesContainer.appendChild(messageDiv);
    scrollToBottom();
    
    return messageId;
}

function removeMessage(messageId) {
    const message = document.getElementById(messageId);
    if (message) {
        message.remove();
    }
}

function scrollToBottom() {
    const messagesContainer = document.getElementById('chatMessages');
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}


