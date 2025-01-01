import { Platform, Dimensions, TouchableOpacity } from "react-native";
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "../screens/HomeScreen";
import NewsDetails from "../screens/NewsDetails";
import WelcomeScreen from "../screens/WelcomeScreen";
import DiscoverScreen from "../screens/DiscoverScreen";
import SavedScreen from "../screens/SavedScreen";
import ProfileScreen from "../screens/ProfileScreen";
import SplashScreens from "../screens/SplashScreens";
import { Ionicons } from "@expo/vector-icons";
import SearchScreen from "../screens/SearchScreen";
import QueryScreen from "../screens/QueryScreen";
import { useColorScheme } from "nativewind";

const android = Platform.OS === "android";
const { width: screenWidth } = Dimensions.get('window');

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const TabNavigator = () => {
  const { colorScheme } = useColorScheme();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => {
          let iconName;

          if (route.name === "Home") {
            iconName = "home";
          } else if (route.name === "Discover") {
            iconName = "compass-outline";
          } else if (route.name === "Saved") {
            iconName = "bookmark-outline";
          } else if (route.name === "Search") {
            iconName = "search-outline";
          } else if (route.name === "Query") {
            iconName = "help-circle-outline";
          }

          const customizeSize = 25;

          return (
            <Ionicons
              name={iconName}
              size={customizeSize}
              color={focused ? (colorScheme === "dark" ? "white" : "black") : "gray"}
            />
          );
        },

        tabBarActiveTintColor: colorScheme === "dark" ? "white" : "black",
        tabBarInactiveTintColor: "gray",
        tabBarLabelStyle: {
          fontSize: 12,
          fontFamily: "SpaceGroteskMedium",
        },
        tabBarStyle: {
          backgroundColor: colorScheme == "dark" ? "black" : "white",
          borderTopWidth: 1,
          borderTopColor: colorScheme === "dark" ? "#333" : "#eee",
        },
        tabBarButton: (props) => {
          const { onPress, ...otherProps } = props;
          return (
            <TouchableOpacity
              {...otherProps}
              onPress={onPress}
              activeOpacity={0.7}
              style={{
                flex: 1,
                paddingVertical: 8,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            />
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Discover" component={DiscoverScreen} />
      <Tab.Screen name="Saved" component={SavedScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen 
        name="Query" 
        component={QueryScreen}
        options={{
          title: "Ask Archives"
        }}
      />
    </Tab.Navigator>
  );
};

export default function AppNavigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="SplashS"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="SplashS" component={SplashScreens} />
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Search" component={SearchScreen} />
        <Stack.Screen name="Query" component={QueryScreen} />
        <Stack.Screen
          name="NewsDetails"
          component={NewsDetails}
          options={{ animation: "slide_from_bottom" }}
        />
        <Stack.Screen name="HomeTabs" component={TabNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
