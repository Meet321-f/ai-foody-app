import pandas as pd
import os

file_path = r'c:\react-project\foody\my\cuisines.csv'

def analyze():
    print(f"Analyzing {file_path}...")
    
    try:
        # Load the CSV
        df = pd.read_csv(file_path)
        
        total_rows = len(df)
        print(f"Total rows: {total_rows}")
        
        # Check for missing values
        missing_values = df.isnull().sum()
        print("\nMissing values per column:")
        print(missing_values)
        
        # Check for duplicates
        duplicates = df.duplicated(subset=['name']).sum()
        print(f"\nDuplicate recipe names: {duplicates}")
        
        # Check for short ingredients/instructions
        short_ingredients = df[df['ingredients'].fillna('').str.len() < 20]
        short_instructions = df[df['instructions'].fillna('').str.len() < 20]
        
        print(f"\nRecipes with very short ingredients (<20 chars): {len(short_ingredients)}")
        print(f"Recipes with very short instructions (<20 chars): {len(short_instructions)}")
        
        # Check for "dirty" data (lots of whitespace)
        # This is harder to quantify but we can check if whitespace is excessive
        
        # Sample some "improper" recipes
        improper = df[
            (df['ingredients'].isnull()) | 
            (df['instructions'].isnull()) | 
            (df['ingredients'].str.len() < 20) | 
            (df['instructions'].str.len() < 20)
        ]
        
        if not improper.empty:
            print("\nSample of 'Improper' recipes:")
            print(improper[['name', 'ingredients', 'instructions']].head(5))
        
        # Value counts for categorical data
        print("\nCuisine distribution (Top 10):")
        print(df['cuisine'].value_counts().head(10))
        
        print("\nDiet distribution:")
        print(df['diet'].value_counts())

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    analyze()
