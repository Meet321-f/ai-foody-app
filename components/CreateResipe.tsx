import GlobalApi from '@/services/GlobalApi';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ImageBackground,
  Platform,
  Dimensions
} from 'react-native';
import ActionSheet, { ActionSheetRef } from "react-native-actions-sheet";
import GENERATE_RECIPE_OPTION_PROMPT from '../services/Prompts';
import Button from './Button';
import LoadingDialog from './LoadingDialog';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

export default function CreateRecipe() {
  const router = useRouter();
  const [userInput, setUserInput] = useState<string>('');
  const [recipeOption, setRecipeOption] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const actionSheetRef = useRef<ActionSheetRef>(null);
  const [openLoading, setOpenLoading] = useState(false);

  const onGenerate = async () => {
    if (!userInput.trim()) {
      Alert.alert('Please enter details');
      return;
    }

    setLoading(true);
    try {
      const prompt = `${GENERATE_RECIPE_OPTION_PROMPT.GENERATE_RECIPE_OPTION_PROMPT}\nUser input: ${userInput}`;
      const result = await GlobalApi.AiModel(prompt);
      const recipeText = result?.choices?.[0]?.message?.content || "No recipe generated.";
      console.log("AI Response:", recipeText);

      try {
        // Remove markdown code blocks if present
        const cleanText = recipeText.replace(/```json|```/g, '').trim();
        
        // Find JSON array or object
        const jsonMatch = cleanText.match(/\[.*\]/s) || cleanText.match(/\{.*\}/s);
        const jsonString = jsonMatch ? jsonMatch[0] : cleanText;
        
        const recipes = JSON.parse(jsonString);
        if (Array.isArray(recipes)) setRecipeOption(recipes);
        else if (typeof recipes === 'object') setRecipeOption([recipes]);
        else throw new Error("Invalid recipe format");
      } catch (e) {
        console.error("Parsing error:", e);
        setRecipeOption([{ recipeName: "Generated Recipe", description: recipeText, ingredients: [] }]);
      }

      console.log("Opening ActionSheet, ref:", actionSheetRef.current);
      if (actionSheetRef.current) {
        actionSheetRef.current.show();
      } else {
        console.error("ActionSheet ref is null");
        Alert.alert("Error", "Could not open options menu.");
      }
    } catch (error) {
        console.error("Generation error:", error);
        Alert.alert("Error", "Failed to generate recipe. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const GenerateCompleteRecipe = async (option: any) => {
    actionSheetRef.current?.hide();
    setOpenLoading(true);
    try {
        const PROMPT = `
        recipeName: ${option.recipeName}
        Description: ${option?.description}
        ${GENERATE_RECIPE_OPTION_PROMPT.GENERATE_COMPLETE_RECIPE || 'Generate a complete recipe'}
        `;
        const result = await GlobalApi.AiModel(PROMPT);
        const content: any = result?.choices[0]?.message?.content;
        console.log("Complete Recipe Response:", content);

        let JSONContent;
        try {
             const cleanText = content.replace(/```json|```/g, '').trim();
             const jsonMatch = cleanText.match(/\{.*\}/s);
             const jsonString = jsonMatch ? jsonMatch[0] : cleanText;
             JSONContent = JSON.parse(jsonString);
        } catch (e) {
            console.error("Complete recipe parsing error:", e);
            // Fallback if parsing fails
             JSONContent = {
                recipeName: option.recipeName,
                description: option.description,
                ingredients: option.ingredients || [],
                instructions: ["Follow the description."],
                cookTime: "30 min",
                servings: "2",
                imagePrompt: option.recipeName
            };
        }

        const imageUrl = await GenerateRecipeImage(JSONContent?.imagePrompt || option.recipeName);
        const savedRecipe = await SaveToDb(JSONContent, imageUrl);
        Alert.alert("Success", "Recipe saved successfully!");
        
        // Navigate to the new recipe
        console.log("Saved Recipe Response:", savedRecipe);
        if (savedRecipe && savedRecipe.id) {
            console.log("Navigating to recipe:", savedRecipe.id);
            router.push(`/recipe/${savedRecipe.id}`);
        } else {
            console.error("Recipe ID missing in response:", savedRecipe);
            Alert.alert("Error", "Recipe saved but could not navigate to details.");
        }
    } catch (error) {
        console.error("Error generating complete recipe:", error);
        Alert.alert("Error", "Failed to save recipe.");
    } finally {
        setOpenLoading(false);
    }
  };

  const GenerateRecipeImage = async (imagePrompt: string) => {
    try {
        const result = await GlobalApi.GenerateAiImage(imagePrompt);
        return result?.data?.image || "https://via.placeholder.com/150";
    } catch (error) {
        console.error("Image generation error:", error);
        return "https://via.placeholder.com/150";
    }
  };

  const SaveToDb = async (content: any, imageUrl: string) => {
    const data = {
        title: content.recipeName || content.title,
        description: content.description,
        ingredients: content.ingredients,
        instructions: content.instructions || content.steps,
        image: imageUrl,
        cookTime: content.cookTime,
        servings: content.servings || content.serveTo
    };
    
    try {
        const result = await GlobalApi.createRecipe(data);
        console.log("Recipe saved to DB", result);
        return result;
    } catch (error) {
        console.error("Error saving to DB:", error);
        throw error;
    }
  };

  return (
    <View style={styles.fullScreen}>
      <ImageBackground
        source={require('../assets/images/Ai2.png')}
        style={styles.bg}
        resizeMode="cover"
      >
        {/* Transparent Glass Blur Effect */}
        <BlurView intensity={60} tint="light" style={styles.glassOverlay}>
          <View style={styles.glassContent}>
            <View style={styles.cardContainer}>
              <Image source={require('../assets/images/pen.gif')} style={styles.penimage} />

              <Text style={styles.heading}>Warm up your stove, and let's get cooking!</Text>
              <Text style={styles.subheading}>Make something for your LOVE! ❤️</Text>

              <View style={styles.inputContainer}>
                <TextInput
                  placeholder="What do you want to create? Add ingredients here..."
                  placeholderTextColor="#666"
                  style={styles.input}
                  multiline
                  numberOfLines={4}
                  value={userInput}
                  onChangeText={setUserInput}
                />
              </View>

              {userInput ? <Text style={styles.previewText}>Input: {userInput}</Text> : null}

              <Button label="Generate Recipe" onPress={onGenerate} icon="sparkles" loading={loading} />
            </View>
          </View>
        </BlurView>

        <LoadingDialog visible={openLoading} />

        <ActionSheet ref={actionSheetRef}>
          <View style={styles.actionSheetContainer}>
              <Text style={styles.actionSheetHeading}>Select Recipe</Text>
              <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {recipeOption.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => GenerateCompleteRecipe(item)}
                    style={styles.recipeOption}
                    disabled={openLoading}
                  >
                      <View style={styles.recipeContent}>
                        <Text style={styles.recipeName}>{item?.recipeName || "Unnamed Recipe"}</Text>
                        <Text style={styles.recipeDescription}>{item?.description}</Text>
                        {item.ingredients && Array.isArray(item.ingredients) && (
                          <Text style={styles.ingredients}>
                            Ingredients: {item.ingredients.join(', ')}
                          </Text>
                        )}
                      </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
        </ActionSheet>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
  },
  bg: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  // Transparent Glass Blur Styles
  glassOverlay: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)', // Very light transparent overlay
  },
  glassContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  cardContainer: {
    width: width * 0.9,
    backgroundColor: 'rgba(255, 149, 128, 0.7)', // More transparent background
    borderRadius: 30,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 25,
    shadowOffset: { width: 0, height: 8 },
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    // backdropFilter: 'blur(10px)', // Not supported in RN
    ...Platform.select({
      android: { 
        elevation: 10,
        backgroundColor: 'rgba(255, 149, 128, 0.75)',
      },
      ios: {
        backgroundColor: 'rgba(255, 149, 128, 0.65)',
      }
    }),
  },
  penimage: {
    width: 65,
    height: 65,
    marginBottom: 20,
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    color: '#FFFFFF',
    marginBottom: 8,
    lineHeight: 32,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  subheading: {
    fontSize: 18,
    textAlign: 'center',
    color: '#FFFFFF',
    marginBottom: 25,
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.25)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  inputContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 20,
    width: '100%',
    marginBottom: 20,
    minHeight: 120,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  input: {
    color: '#333',
    padding: 18,
    fontSize: 15,
    textAlignVertical: 'top',
    fontWeight: '400',
    minHeight: 120,
  },
  actionSheetBlur: {
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    overflow: 'hidden',
  },
  actionSheetContainer: {
    padding: 25,
    maxHeight: 450,
    backgroundColor: '#fff', // Ensure background is white
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },
  actionSheetHeading: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 15,
    textAlign: 'center',
    color: '#6A1B9A',
  },
  scrollView: {
    maxHeight: 380,
  },
  recipeOption: {
    borderRadius: 18,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(155, 89, 182, 0.3)',
    backgroundColor: '#f9f9f9', // Light background for options
  },
  recipeContent: {
    padding: 18,
  },
  recipeName: {
    fontSize: 19,
    fontWeight: '700',
    color: '#6A1B9A',
    marginBottom: 6,
  },
  recipeDescription: {
    marginTop: 4,
    fontSize: 15,
    color: '#8E24AA',
    lineHeight: 20,
  },
  ingredients: {
    marginTop: 8,
    fontSize: 13,
    fontStyle: 'italic',
    color: '#9C27B0',
    lineHeight: 18,
  },
  previewText: {
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
    fontSize: 14,
    fontStyle: 'italic',
  },
});