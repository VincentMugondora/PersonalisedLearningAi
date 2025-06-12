declare module 'react-native-onboarding-swiper' {
  import { ComponentType } from 'react';
  import { StyleProp, ViewStyle, TextStyle, ImageSourcePropType } from 'react-native';

  export interface OnboardingPage {
    backgroundColor: string;
    image: React.ReactElement;
    title: string;
    subtitle: string;
    titleStyles?: StyleProp<TextStyle>;
    subTitleStyles?: StyleProp<TextStyle>;
  }

  export interface OnboardingProps {
    pages: OnboardingPage[];
    onSkip?: () => void;
    onDone?: () => void;
    showSkip?: boolean;
    showNext?: boolean;
    showDone?: boolean;
    bottomBarHighlight?: boolean;
    bottomBarHeight?: number;
    titleStyles?: StyleProp<TextStyle>;
    subTitleStyles?: StyleProp<TextStyle>;
    containerStyles?: StyleProp<ViewStyle>;
    imageContainerStyles?: StyleProp<ViewStyle>;
    skipLabel?: string;
    nextLabel?: string;
    doneLabel?: string;
  }

  const Onboarding: ComponentType<OnboardingProps>;
  export default Onboarding;
} 