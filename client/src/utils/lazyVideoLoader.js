export const lazyLoadVideos = () => {
    const videos = document.querySelectorAll('video[data-src]')

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const video = entry.target
                const src = video.dataset.src
                
                if (src && !video.src) {
                    video.src = src
                    video.load()
                }
            }
        })
    }, {
        threshold: 0,
    })

    videos.forEach(video => observer.observe(video))
}

// © 2025 Pitipat Pattamawilai. All Rights Reserved.