# Video Adaptation Platform

Adapt videos to any audience using AI-powered transcription, rewriting, and video generation. Used for marketing to different audiences based on age, technical expertise, language, and more.

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **FFmpeg** (for video processing)
- **Azure OpenAI** account with API access
- **Azure Speech Services** (for STT/TTS)
- **Sora model deployment** (for video generation)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd intern-hackathon
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Edit `.env.local` with your Azure credentials:
   ```env
   AZURE_OPENAI_API_KEY=your_azure_openai_api_key_here
   AZURE_OPENAI_API_VERSION=2023-05-15
   AZURE_OPENAI_DEPLOYMENT_NAME=your_deployment_name
   AZURE_OPENAI_INSTANCE_NAME=your_instance_name
   AZURE_OPENAI_ENDPOINT=https://your-instance.openai.azure.com
   AZURE_SPEECH_KEY=your_speech_key_here
   AZURE_SPEECH_REGION=your_speech_region_here
   ```

4. **Install FFmpeg**
   
   **Windows:**
   ```bash
   # Using Chocolatey
   choco install ffmpeg
   
   # Or download from https://ffmpeg.org/download.html
   ```
   
   **macOS:**
   ```bash
   brew install ffmpeg
   ```
   
   **Linux (Ubuntu/Debian):**
   ```bash
   sudo apt update
   sudo apt install ffmpeg
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
intern-hackathon/
├── pages/                 # Next.js pages and API routes
│   ├── index.tsx         # Upload + audience input
│   ├── compare.tsx       # Final playback + comparison UI
│   └── api/              # API endpoints
│       ├── upload.ts     # Handles video upload
│       ├── transcribe.ts # Transcribes video via Azure STT
│       ├── parse-audience.ts # Extracts audience metadata
│       ├── rewrite.ts    # Transcript analysis + rewriting
│       ├── tts.ts        # Generates synthetic narration
│       ├── generate.ts   # Reconstructs final video
│       └── result.ts     # Returns video and transcript diff
├── lib/                  # Utility libraries
│   ├── langchain.ts      # Chains and LLM utilities
│   ├── azureOpenAI.ts    # API keys and wrappers
│   ├── sora.ts           # Azure Sora Video Generation handler
│   └── videoUtils.ts     # FFmpeg slicing + merging helpers
├── components/           # React components
│   ├── UploadBox.tsx     # Video upload component
│   ├── AudienceForm.tsx  # Audience metadata form
│   ├── VideoPlayer.tsx   # Custom video player
│   ├── TranscriptDiff.tsx # Transcript comparison
│   └── AudienceCard.tsx  # Audience information display
└── styles/               # Styling
    └── globals.css       # Tailwind + custom styles
```

## 🔧 Configuration

### Azure OpenAI Setup

1. Create an Azure OpenAI resource in the Azure portal
2. Deploy a model (GPT-4 recommended) for text generation
3. Deploy a Sora model for video generation
4. Get your API key and endpoint details
5. Update `.env.local` with your credentials

### Azure Speech Services Setup

1. Create a Speech resource in Azure
2. Get your subscription key and region
3. Update `.env.local` with your speech credentials

### Sora Video Generation Setup

1. Ensure you have access to Sora in your Azure OpenAI resource
2. Deploy a Sora model in your Azure OpenAI resource
3. The same API key and endpoint are used for both text and video generation
4. Sora uses the `preview` API version

## 🎯 Features

- **Video Upload**: Drag-and-drop video upload with format validation
- **Audience Targeting**: Comprehensive audience metadata collection
- **AI Transcription**: Azure Speech-to-Text integration
- **Content Adaptation**: LangChain-powered transcript rewriting
- **Voice Synthesis**: Azure Text-to-Speech with voice selection
- **Video Generation**: Azure Sora-powered video generation
- **Comparison Interface**: Side-by-side original vs adapted video
- **Transcript Analysis**: Diff highlighting and similarity metrics

## 🛠️ Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript type checking
```

### Adding New Features

1. **New API Endpoint**: Add to `pages/api/`
2. **New Component**: Add to `components/`
3. **New Utility**: Add to `lib/`
4. **Styling**: Use Tailwind classes or add to `styles/globals.css`

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Azure Static Web Apps
- DigitalOcean App Platform

## 📝 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `AZURE_OPENAI_API_KEY` | Azure OpenAI API key (used for both text and video) | Yes |
| `AZURE_OPENAI_API_VERSION` | API version for text generation | Yes |
| `AZURE_OPENAI_DEPLOYMENT_NAME` | Text model deployment name | Yes |
| `AZURE_OPENAI_INSTANCE_NAME` | Azure instance name | Yes |
| `AZURE_OPENAI_ENDPOINT` | Azure OpenAI endpoint | Yes |
| `AZURE_SPEECH_KEY` | Speech Services key | Yes |
| `AZURE_SPEECH_REGION` | Speech Services region | Yes |

**Note**: Sora video generation uses the same Azure OpenAI credentials and endpoint, with the `preview` API version.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues:

1. Check the [Issues](../../issues) page
2. Create a new issue with detailed information
3. Include error messages and steps to reproduce

## 🔮 Roadmap

- [ ] Enhanced Sora integration with more video styles
- [ ] Multi-language support
- [ ] Batch processing
- [ ] Advanced video effects
- [ ] Real-time collaboration
- [ ] Mobile app
