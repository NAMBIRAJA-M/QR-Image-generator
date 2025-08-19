# Advanced QR Code Generator Pro

A modern, feature-rich web application for generating various types of QR codes with customization options, built with Node.js and Express.

## 🚀 Features

### Multiple QR Code Types
- **Website URLs** - Direct links to websites
- **Plain Text** - Any text content
- **Email Addresses** - Quick email composition
- **Phone Numbers** - Direct calling
- **SMS Messages** - Pre-filled text messages
- **WiFi Networks** - Easy WiFi sharing with SSID, password, and encryption type
- **Contact Cards (vCard)** - Business card information
- **Geolocation** - GPS coordinates with current location detection

### Advanced Customization
- **Color Customization** - Custom foreground and background colors
- **Size Options** - Multiple size presets (200px to 500px)
- **Error Correction Levels** - L (7%), M (15%), Q (25%), H (30%)
- **Real-time Preview** - See your QR code as you customize

### Modern User Experience
- **Responsive Design** - Works perfectly on desktop, tablet, and mobile
- **Tabbed Interface** - Generate, History, and Statistics tabs
- **Toast Notifications** - Real-time feedback for all actions
- **Loading States** - Smooth loading animations
- **Input Validation** - Real-time validation for URLs and emails
- **Geolocation Support** - Automatic current location detection

### History & Management
- **QR Code History** - Save and manage your generated QR codes
- **Statistics Dashboard** - Track usage and types generated
- **Download Options** - Direct download with custom filenames
- **Share Functionality** - Native sharing or clipboard copy
- **Delete Management** - Remove unwanted QR codes

### Technical Features
- **RESTful API** - Clean API endpoints for all operations
- **Error Handling** - Comprehensive error handling and user feedback
- **Security** - Helmet.js for security headers
- **Performance** - Compression middleware for faster loading
- **CORS Support** - Cross-origin resource sharing enabled

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm (Node Package Manager)

## 🛠️ Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/qr-code-generator.git
   cd qr-code-generator
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the application:**
   ```bash
   # Development mode with auto-reload
   npm run dev
   
   # Production mode
   npm start
   ```

4. **Open your browser:**
   Navigate to `http://localhost:3000`

## 🎯 Usage

### Generating QR Codes

1. **Select QR Type:** Choose from the dropdown menu
2. **Enter Content:** Fill in the required fields based on the selected type
3. **Customize:** Adjust colors, size, and error correction as needed
4. **Generate:** Click the "Generate QR Code" button
5. **Download/Share:** Use the action buttons to download or share your QR code

### QR Code Types Guide

#### Website URL
- Enter any valid website URL
- Supports HTTP and HTTPS protocols

#### Plain Text
- Enter any text content
- Perfect for sharing messages or information

#### Email
- Enter email address
- Generates mailto: link for quick email composition

#### Phone Number
- Enter phone number with country code
- Generates tel: link for direct calling

#### SMS
- Enter phone number and message
- Generates SMS with pre-filled message

#### WiFi Network
- Enter SSID (network name)
- Enter password
- Select encryption type (WPA, WEP, or no password)

#### Contact Card (vCard)
- Enter name, phone, email, and company
- Generates standard vCard format

#### Geolocation
- Enter latitude and longitude coordinates
- Use "Get Current Location" button for automatic detection

### History Management

- **View History:** Click the "History" tab to see all generated QR codes
- **Download:** Click the download icon to re-download any QR code
- **Delete:** Click the trash icon to remove QR codes from history
- **Statistics:** View usage statistics in the "Stats" tab

## 🔧 API Endpoints

### Generate QR Code
```
POST /api/generate-qr
Content-Type: application/json

{
  "type": "url",
  "content": "https://example.com",
  "options": {
    "foregroundColor": "#000000",
    "backgroundColor": "#FFFFFF",
    "width": 300,
    "errorCorrectionLevel": "M"
  }
}
```

### Get History
```
GET /api/history
```

### Save to History
```
POST /api/save-to-history
Content-Type: application/json

{
  "filename": "qr_uuid.png",
  "content": "QR content",
  "type": "url",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Delete QR Code
```
DELETE /api/delete-qr/:filename
```

### Get Statistics
```
GET /api/stats
```

## 🎨 Customization Options

### Colors
- **Foreground Color:** The color of the QR code pattern
- **Background Color:** The background color of the QR code

### Size
- **Small:** 200px (for compact use)
- **Medium:** 300px (default, balanced)
- **Large:** 400px (for better scanning)
- **Extra Large:** 500px (for high-quality printing)

### Error Correction
- **Low (L):** 7% - Minimal error correction
- **Medium (M):** 15% - Default, good balance
- **Quartile (Q):** 25% - Higher error correction
- **High (H):** 30% - Maximum error correction for damaged codes

## 📱 Mobile Support

The application is fully responsive and works great on mobile devices:
- Touch-friendly interface
- Optimized for small screens
- Native sharing support on mobile browsers
- Geolocation support for location-based QR codes

## 🔒 Security Features

- **Helmet.js:** Security headers for protection
- **Input Validation:** Server-side and client-side validation
- **CORS Configuration:** Proper cross-origin handling
- **Error Handling:** Comprehensive error management

## 🚀 Performance Optimizations

- **Compression:** Gzip compression for faster loading
- **Static File Serving:** Optimized static file delivery
- **Efficient QR Generation:** Fast QR code generation with quality options
- **Responsive Images:** Optimized image delivery

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Express.js](https://expressjs.com/)
- QR Code generation powered by [qrcode](https://www.npmjs.com/package/qrcode)
- Modern UI with [Font Awesome](https://fontawesome.com/) icons
- Responsive design with CSS Grid and Flexbox

## 📞 Support

If you have any questions or need help, please open an issue on GitHub or contact the maintainers.

---

**Made with ❤️ for the developer community**
