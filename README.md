# XDownload - Minimalist Download Tool

## Introduction

XDownload is a minimalist download tool built with Rust + Tauri, focused on media content downloading.

## Demo

![Demo gif](assets/demo.gif)
![Demo mp4](assets/demo.mp4)

## Features

- ✅ Supports major video platforms (Bilibili, YouTube, NetEase Music, etc.)
- ✅ One-click quick commands, no need to remember complex parameters
- ✅ Automatically saves to `xdownloads` folder in current directory
- ✅ Cross-platform support (Windows/macOS/Linux)
- ✅ Minimalist interface, focused on download functionality

## Quick Start

### Prerequisites

Before using XDownload, you need to install yt-dlp:

**Windows:**
```bash
# Using winget (recommended)
winget install yt-dlp

# Or download from GitHub and add to PATH
# https://github.com/yt-dlp/yt-dlp/releases
```

**macOS:**
```bash
# Using Homebrew
brew install yt-dlp
```

**Linux:**
```bash
# Using pip
pip install yt-dlp

# Or using package manager (Ubuntu/Debian)
sudo apt install yt-dlp
```

### Optional: Install FFmpeg (for video merging)

For best experience with video downloads, install FFmpeg:

**Windows:**
```bash
winget install ffmpeg
```

**macOS:**
```bash
brew install ffmpeg
```

**Linux:**
```bash
# Ubuntu/Debian
sudo apt install ffmpeg

# CentOS/RHEL
sudo yum install ffmpeg
```

### Install Dependencies

```bash
pnpm install
```

### Development Mode

```bash
pnpm tauri dev
```

### Build Release

```bash
pnpm tauri build
```

## Usage

### Quick Commands

The app includes built-in download commands for instant use:

- 🎵 **Music** - Download audio (NetEase Music example)
- 🎬 **Video** - Download video (Bilibili example)
- 🖼️ **Images** - Download thumbnails
- 📺 **HD Quality** - HD download (YouTube example)
- 📱 **Mobile** - Mobile optimized download
- 📄 **Subtitles** - Download subtitles
- 🔍 **Info** - View video format information

### Custom Commands

Enter any `yt-dlp` command in the input box, supporting all yt-dlp parameters and features.

## Tech Stack

- **Backend**: Rust + Tauri
- **Frontend**: React + TypeScript + Tailwind CSS
- **Download Engine**: yt-dlp

## Download Path

All downloaded content is automatically saved to the `xdownloads` folder in the current working directory.

## Troubleshooting

For detailed usage instructions and troubleshooting, please refer to the [yt-dlp documentation](https://github.com/yt-dlp/yt-dlp).

Common issues:
- Ensure yt-dlp is installed and in system PATH
- Some platforms (like Douyin) may require cookies for download
- FFmpeg is recommended for video merging operations

## Release

### Automated Release Process

XDownload 使用 GitHub Actions 自动构建和发布。只需推送版本标签即可自动创建 release：

1. **提交代码更改**
   ```bash
   git add .
   git commit -m "Release v1.0.0"
   ```

2. **创建并推送版本标签**
   ```bash
   # 创建语义化版本标签
   git tag v1.0.0
   
   # 推送标签触发自动构建
   git push origin v1.0.0
   ```

3. **监控构建状态**
   - 访问 GitHub Actions 页面查看构建进度
   - 构建完成后，在 Releases 页面下载 Windows 安装包

### 构建产物

自动构建会生成以下 Windows 安装包：
- `xdownload_1.0.0_x64-setup.exe` - Windows 安装程序
- `xdownload_1.0.0_x64.msi` - Windows MSI 安装包

### 手动构建（开发环境）

如需在本地测试构建：
```bash
# 安装依赖
pnpm install

# 构建应用
pnpm tauri build

# 构建文件位于
# src-tauri/target/release/bundle/
```

## License

MIT License