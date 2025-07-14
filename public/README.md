# 🗡️ Ragnar - Free Jokes & Memes Website

A simple, elegant static website that displays random memes and jokes using free APIs. Built with Bootstrap for a responsive, mobile-friendly experience.

## ✨ Features

- **Random Memes**: Fetches fresh memes from the Imgflip API
- **Responsive Design**: 3-column grid layout that adapts to all screen sizes
- **Bootstrap Styling**: Clean, modern design using Bootstrap 5
- **No Dependencies**: Pure vanilla JavaScript, no frameworks required
- **Static Website**: Can be hosted anywhere - GitHub Pages, Netlify, Vercel, etc.
- **Privacy-Focused**: No data collection, no tracking, no accounts needed

## 🗂️ Project Structure

```
ragnar/
├── index.html          # Main page with meme grid
├── about.html          # About page
├── terms.html          # Terms and conditions
├── privacy.html        # Privacy policy
├── style.css           # Custom styles (minimal)
├── script.js           # JavaScript for meme fetching
└── README.md          # This file
```

## 🚀 Getting Started

1. **Clone or download** this repository
2. **Open `index.html`** in your web browser
3. **Click "Load Fresh Memes"** to fetch new content
4. **Enjoy!** The memes will load in a beautiful 3-column grid

### Local Development

Simply open `index.html` in any modern web browser. No build process or server required!

### Deployment

Deploy to any static hosting service:

- **GitHub Pages**: Push to GitHub and enable Pages
- **Netlify**: Drag and drop the folder
- **Vercel**: Connect your GitHub repo
- **Firebase Hosting**: Use Firebase CLI
- **Any web server**: Upload files to your hosting provider

## 🔧 Customization

### Changing the Grid Layout

Edit the JavaScript in `script.js`:
- Change the loop count in `loadMemes()` to load more/fewer memes
- Modify the Bootstrap classes in `createMemeCard()` for different grid layouts

### Styling

- Most styling uses Bootstrap classes
- Custom CSS is minimal and located in `style.css`
- Modify colors by changing Bootstrap theme or adding custom CSS

### API Integration

Currently uses the Imgflip API. To change or add APIs:
1. Modify the `fetchRandomMeme()` function in `script.js`
2. Update the API endpoint and response handling
3. Ensure the API supports CORS for browser requests

## 🌐 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers

## 📱 Mobile Responsive

The website is fully responsive with:
- 3 columns on large screens (lg)
- 2 columns on medium screens (md)
- 1 column on small screens (sm)

## 🔒 Privacy & Security

- No data collection or tracking
- No cookies or local storage
- All content fetched from external APIs
- Privacy-first design approach

## 🛠️ Technologies Used

- **HTML5**: Semantic markup
- **CSS3**: Modern styling with Bootstrap 5
- **JavaScript (ES6+)**: Async/await, fetch API, classes
- **Bootstrap 5**: Responsive framework
- **Imgflip API**: Meme content source

## 📄 Pages

- **Home (`index.html`)**: Main meme grid
- **About (`about.html`)**: Information about the site
- **Terms (`terms.html`)**: Terms and conditions
- **Privacy (`privacy.html`)**: Privacy policy

## 🤝 Contributing

This is a simple static website. Feel free to:
- Add new API integrations
- Improve the design
- Add new features
- Fix bugs

## 📝 License

Free to use and modify. No license restrictions.

## 🎯 Future Enhancements

Potential improvements:
- Add more meme APIs for variety
- Implement sharing functionality
- Add favorite/bookmark features
- Create meme categories
- Add search functionality

---

**Built with ❤️ for spreading laughter across the internet!** 