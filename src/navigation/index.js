import { Platform, Dimensions, TouchableOpacity } from "react-native";
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import HomeScreen from "../screens/HomeScreen";
import NewsDetails from "../screens/NewsDetails";
import WelcomeScreen from "../screens/WelcomeScreen";
import DiscoverScreen from "../screens/DiscoverScreen";
import SavedScreen from "../screens/SavedScreen";
import ProfileScreen from "../screens/ProfileScreen";
import SplashScreens from "../screens/SplashScreens";
import SearchScreen from "../screens/SearchScreen";

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
          }

          return (
            <Ionicons
              name={iconName}
              size={24}
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
          backgroundColor: colorScheme === "dark" ? "black" : "white",
          borderTopWidth: 1,
          borderTopColor: colorScheme === "dark" ? "#333" : "#eee",
        },
        tabBarButton: (props) => (
          <TouchableOpacity
            {...props}
            activeOpacity={0.7}
            style={{
              flex: 1,
              paddingVertical: 8,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          />
        ),
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Discover" component={DiscoverScreen} />
      <Tab.Screen name="Saved" component={SavedScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
    </Tab.Navigator>
  );
};

export default function AppNavigation() {
  const { colorScheme } = useColorScheme();

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="SplashS"
        screenOptions={{
          headerShown: false,
          headerLeft: () => (
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons 
                name="chevron-back" 
                size={24} 
                color={colorScheme === "dark" ? "white" : "black"} 
              />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity>
              <Ionicons 
                name="bookmark-outline" 
                size={24} 
                color={colorScheme === "dark" ? "white" : "black"} 
              />
            </TouchableOpacity>
          )
        }}
      >
        <Stack.Screen name="SplashS" component={SplashScreens} />
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Search" component={SearchScreen} />
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
