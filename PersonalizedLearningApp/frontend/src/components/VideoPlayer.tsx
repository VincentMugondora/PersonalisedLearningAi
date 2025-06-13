import React from 'react';
import { StyleSheet, View, Dimensions, Platform } from 'react-native';
import WebView from 'react-native-webview';
import { MaterialIcons } from '@expo/vector-icons';

interface VideoPlayerProps {
  videoId: string;
  title?: string;
  onError?: (error: any) => void;
  onReady?: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoId,
  title,
  onError,
  onReady,
}) => {
  // YouTube embed URL with player parameters
  const embedUrl = `https://www.youtube.com/embed/${videoId}?playsinline=1&modestbranding=1&rel=0`;

  // Get video ID from various YouTube URL formats
  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : url;
  };

  // Handle WebView messages
  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.event === 'onReady' && onReady) {
        onReady();
      } else if (data.event === 'onError' && onError) {
        onError(data.error);
      }
    } catch (error) {
      console.error('Error parsing WebView message:', error);
    }
  };

  // Inject JavaScript to handle YouTube player events
  const injectedJavaScript = `
    (function() {
      window.addEventListener('message', function(event) {
        if (event.data && event.data.type === 'onReady') {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            event: 'onReady'
          }));
        }
      });

      // Handle player errors
      window.onerror = function(message, source, lineno, colno, error) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          event: 'onError',
          error: message
        }));
      };
    })();
  `;

  return (
    <View style={styles.container}>
      <WebView
        style={styles.video}
        source={{ uri: embedUrl }}
        allowsFullscreenVideo
        javaScriptEnabled
        domStorageEnabled
        startInLoadingState
        onMessage={handleMessage}
        injectedJavaScript={injectedJavaScript}
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        androidLayerType={Platform.OS === 'android' ? 'hardware' : undefined}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
    borderRadius: 8,
    overflow: 'hidden',
    ...Platform.select({
      web: {
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
      },
    }),
  },
  video: {
    flex: 1,
  },
});

export default VideoPlayer; 