import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import React, { memo, useMemo } from "react";
import { heightPercentageToDP as hp } from "react-native-responsive-screen";

const FONT_SIZE = 1.6;
const PADDING_RIGHT = 20;

const CategoryButton = memo(({ category, isActive, onPress }) => {
  const buttonClass = isActive
    ? "bg-green-700"
    : "bg-black/10 dark:bg-neutral-400";

  const textClass = isActive
    ? "text-white"
    : "text-gray-600 dark:text-neutral-600";

  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex items-center space-y-1"
    >
      <View className={`rounded-full py-2 px-4 ${buttonClass}`}>
        <Text
          className={`capitalize ${textClass}`}
          style={{ fontSize: hp(FONT_SIZE) }}
        >
          {category.title}
        </Text>
      </View>
    </TouchableOpacity>
  );
});

const CategoriesCard = ({ categories, activeCategory, handleChangeCategory }) => {
  const renderCategories = useMemo(() => 
    categories.map((category, index) => (
      <CategoryButton
        key={index}
        category={category}
        isActive={category.title === activeCategory}
        onPress={() => handleChangeCategory(category.title)}
      />
    ))
  , [categories, activeCategory, handleChangeCategory]);

  return (
    <View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="space-x-4"
        contentContainerStyle={{ paddingRight: PADDING_RIGHT }}
      >
        {renderCategories}
      </ScrollView>
    </View>
  );
};

CategoryButton.displayName = 'CategoryButton';
CategoriesCard.displayName = 'CategoriesCard';

export default memo(CategoriesCard);
