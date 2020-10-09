import React, { FunctionComponent, useRef } from "react"
import {
  createStackNavigator,
  TransitionPresets,
  HeaderBackButton,
} from "@react-navigation/stack"
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"
import {
  LinkingOptions,
  NavigationContainer,
  NavigationContainerRef,
  useNavigation,
} from "@react-navigation/native"
import { useTranslation } from "react-i18next"
import { SvgXml } from "react-native-svg"

import { ModalStackScreens, HomeStackScreens } from "./index"
import { useOnboardingContext } from "../OnboardingContext"
import { useAnalyticsContext } from "../AnalyticsContext"
import { WelcomeStackScreens, Stacks } from "./index"
import MainTabNavigator from "./MainTabNavigator"
import HowItWorksStack from "./HowItWorksStack"
import ActivationStack from "./ActivationStack"
import SettingsStack from "./SettingsStack"
import Welcome from "../Welcome"
import LanguageSelection from "../modals/LanguageSelection"
import ProtectPrivacy from "../modals/ProtectPrivacy"
import AffectedUserStack from "../AffectedUserFlow/"
import AnonymizedDataConsentScreen from "../modals/AnonymizedDataConsentScreen"
import SelfAssessmentStack from "./SelfAssessmentStack"
import ExposureDetectionStatus from "../Home/ExposureDetectionStatus"
import BluetoothInfo from "../Home/BluetoothInfo"
import ExposureNotificationsInfo from "../Home/ExposureNotificationsInfo"
import LocationInfo from "../Home/LocationInfo"
import CallbackStack from "./CallbackStack"

import {
  Headers,
  Colors,
  Iconography,
  Typography,
  Spacing,
  Layout,
} from "../styles"
import { Icons } from "../assets"

const Stack = createStackNavigator()

const defaultScreenOptions = {
  headerShown: false,
}

const settingsStackTransitionPreset = Platform.select({
  ios: TransitionPresets.SlideFromRightIOS,
  android: TransitionPresets.DefaultTransition,
})

const linking: LinkingOptions = {
  prefixes: ["pathcheck://"],
  config: {
    screens: {
      ExposureHistoryFlow: "exposureHistory",
    },
  },
}

const MainNavigator: FunctionComponent = () => {
  const { t } = useTranslation()
  const navigation = useNavigation()
  const { isOnboardingComplete } = useOnboardingContext()
  const { trackScreenView } = useAnalyticsContext()
  const navigationRef = useRef<NavigationContainerRef>(null)
  const routeNameRef = useRef<string>()

  const setInitialRoute = () => {
    routeNameRef.current = navigationRef?.current?.getCurrentRoute()?.name
  }

  const trackPageView = () => {
    const previousRouteName = routeNameRef.current
    const currentRouteName = navigationRef?.current?.getCurrentRoute()?.name

    if (currentRouteName && previousRouteName !== currentRouteName) {
      trackScreenView(currentRouteName)
    }

    routeNameRef.current = currentRouteName
  }

  const headerLeftBackButton = () => <HeaderLeftBackButton />
  const HeaderLeftBackButton = () => {
    const { t } = useTranslation()
    return (
      <HeaderBackButton
        tintColor={Colors.primary150}
        onPress={() => navigation.goBack()}
        label={t("screen_titles.home")}
      />
    )
  }

  interface ModalHeaderProps {
    headerTitle: string
  }
  const modalHeader = ({ headerTitle }: ModalHeaderProps) => (
    <ModalHeader headerTitle={headerTitle} />
  )
  const ModalHeader: FunctionComponent<ModalHeaderProps> = ({
    headerTitle,
  }) => {
    const navigation = useNavigation()

    return (
      <View style={style.container}>
        <Text numberOfLines={10} style={style.headerText}>
          {headerTitle}
        </Text>
        <TouchableOpacity
          onPress={navigation.goBack}
          hitSlop={{ top: 30, right: 30, bottom: 30, left: 30 }}
        >
          <SvgXml
            xml={Icons.XInCircle}
            fill={Colors.neutral30}
            width={Iconography.small}
            height={Iconography.small}
          />
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <NavigationContainer
      linking={linking}
      onReady={setInitialRoute}
      ref={navigationRef}
      onStateChange={trackPageView}
    >
      <Stack.Navigator>
        {isOnboardingComplete ? (
          <>
            <Stack.Screen
              name={"App"}
              component={MainTabNavigator}
              options={defaultScreenOptions}
            />
            <Stack.Screen
              name={Stacks.Settings}
              component={SettingsStack}
              options={{
                ...settingsStackTransitionPreset,
                headerShown: false,
              }}
            />
          </>
        ) : (
          <>
            <Stack.Screen
              name={WelcomeStackScreens.Welcome}
              component={Welcome}
              options={defaultScreenOptions}
            />
            <Stack.Screen
              name={Stacks.HowItWorks}
              options={defaultScreenOptions}
            >
              {(props) => (
                <HowItWorksStack
                  {...props}
                  destinationOnSkip={Stacks.Activation}
                />
              )}
            </Stack.Screen>
            <Stack.Screen
              name={Stacks.Activation}
              component={ActivationStack}
              options={{
                ...defaultScreenOptions,
                gestureEnabled: false,
              }}
            />
          </>
        )}
        <Stack.Screen
          name={ModalStackScreens.LanguageSelection}
          component={LanguageSelection}
          options={{
            ...TransitionPresets.ModalTransition,
            headerShown: true,
            header: () =>
              modalHeader({ headerTitle: t("screen_titles.select_language") }),
          }}
        />
        <Stack.Screen
          name={ModalStackScreens.ProtectPrivacy}
          component={ProtectPrivacy}
          options={{
            ...TransitionPresets.ModalTransition,
            headerShown: true,
            header: () =>
              modalHeader({ headerTitle: t("screen_titles.protect_privacy") }),
          }}
        />
        <Stack.Screen
          name={Stacks.AffectedUserStack}
          component={AffectedUserStack}
        />
        <Stack.Screen name={ModalStackScreens.HowItWorksReviewFromSettings}>
          {(props) => (
            <HowItWorksStack {...props} destinationOnSkip={Stacks.Settings} />
          )}
        </Stack.Screen>
        <Stack.Screen name={ModalStackScreens.HowItWorksReviewFromConnect}>
          {(props) => (
            <HowItWorksStack {...props} destinationOnSkip={Stacks.Connect} />
          )}
        </Stack.Screen>
        <Stack.Screen
          name={ModalStackScreens.AnonymizedDataConsent}
          component={AnonymizedDataConsentScreen}
        />
        <Stack.Screen
          name={ModalStackScreens.SelfAssessmentFromExposureDetails}
          options={TransitionPresets.ModalTransition}
        >
          {(props) => {
            return (
              <SelfAssessmentStack
                {...props}
                destinationOnCancel={Stacks.ExposureHistoryFlow}
              />
            )
          }}
        </Stack.Screen>
        <Stack.Screen name={ModalStackScreens.SelfAssessmentFromHome}>
          {(props) => {
            return (
              <SelfAssessmentStack
                {...props}
                destinationOnCancel={Stacks.Home}
              />
            )
          }}
        </Stack.Screen>
        <Stack.Screen
          name={HomeStackScreens.ExposureDetectionStatus}
          component={ExposureDetectionStatus}
          options={{
            ...Headers.headerMinimalOptions,
            headerLeft: headerLeftBackButton,
          }}
        />
        <Stack.Screen
          name={HomeStackScreens.BluetoothInfo}
          component={BluetoothInfo}
        />
        <Stack.Screen
          name={HomeStackScreens.ExposureNotificationsInfo}
          component={ExposureNotificationsInfo}
        />
        <Stack.Screen
          name={HomeStackScreens.LocationInfo}
          component={LocationInfo}
        />
        <Stack.Screen
          name={ModalStackScreens.CallbackStack}
          component={CallbackStack}
          options={{
            headerShown: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  )
}

const style = StyleSheet.create({
  container: {
    width: "100%",
    paddingTop: Spacing.massive,
    padding: Spacing.large,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    backgroundColor: Colors.secondary10,
  },
  headerText: {
    ...Typography.header1,
    color: Colors.primary125,
    maxWidth: Layout.screenWidth * 0.8,
  },
})

export default MainNavigator
