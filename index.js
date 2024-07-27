document.addEventListener("DOMContentLoaded", async () => {
    const url = 'https://pornhub2.p.rapidapi.com/v1/search-videos?query=Lana%20Rhoades&page=1';
    const options = {
        method: 'GET',
        headers: {
            'x-rapidapi-key': '1e9c724468msh9d90cf6bc4b8b22p1dadb3jsn3a31e2faab1a',
            'x-rapidapi-host': 'pornhub2.p.rapidapi.com'
        }
    };

    const container = document.getElementById('data-container');

    try {
        const response = await fetch(url, options);
        
        // Handle rate limit or API error status
        if (response.status === 429) { // Assuming 429 Too Many Requests indicates rate limiting
            const resetTime = new Date().getTime() + 30 * 24 * 60 * 60 * 1000; // 30 days from now
            localStorage.setItem('rateLimitReset', resetTime); // Store the reset time
            
            displayCountdown(resetTime);
        } else if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        } else {
            const result = await response.json();
            container.innerHTML = ''; // Clear existing content

            if (result.videos && Array.isArray(result.videos)) {
                result.videos.forEach(video => {
                    const videoDiv = document.createElement('div');
                    videoDiv.className = 'col-md-4 mb-4 video-item';

                    const videoUrl = `https://www.pornhub.com/view_video.php?viewkey=${video.view_key}`;
                    const uploaderUrl = `https://www.pornhub.com${video.uploader.url}`;

                    videoDiv.innerHTML = `
                        <div class="card">
                          <img src="${video.thumbnail}" alt="${video.title}" class="card-img-top">
                          <div class="card-body bg-black text-white rounded-bottom">
                            <h5 class="card-title">${video.title}</h5>
                            <p class="card-text">Duration: ${video.duration}</p>
                            <p class="card-text">Views: ${video.views}</p>
                            <p class="card-text">Rating: ${video.rating}</p>
                            <a href="${videoUrl}" target="_blank" class="btn btn-primary">Watch Video</a>
                            <p class="mt-2">Uploader: <a href="${uploaderUrl}" target="_blank" class="video-link">${video.uploader.name}</a></p>
                          </div>
                        </div>
                    `;

                    container.appendChild(videoDiv);
                });
            } else {
                container.innerHTML = '<p class="error-message">No videos found</p>';
            }
        }
    } catch (error) {
        console.error('Fetch error:', error);
        container.innerHTML = '<p class="error-message">Error loading videos.</p>';
    }
});

function displayCountdown(resetTime) {
    const container = document.getElementById('data-container');
    
    function updateCountdown() {
        const now = new Date().getTime();
        const distance = resetTime - now;
        
        if (distance <= 0) {
            container.innerHTML = '<p class="error-message">API limit reset. You can now request data again.</p>';
            localStorage.removeItem('rateLimitReset');
            return;
        }
        
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        container.innerHTML = `
            <p class="error-message">API limit reached. Try again in ${days} days ${hours} hours ${minutes} minutes ${seconds} seconds.</p>
        `;
    }
    
    updateCountdown();
    setInterval(updateCountdown, 1000);
}

// Check if there's a stored reset time in localStorage
const storedResetTime = localStorage.getItem('rateLimitReset');
if (storedResetTime) {
    const resetTime = parseInt(storedResetTime, 10);
    displayCountdown(resetTime);
} else {
    // Optionally, display a message or perform other actions if no reset time is stored
    const container = document.getElementById('data-container');
    container.innerHTML = '<p class="error-message">No rate limit information available.</p>';
}
