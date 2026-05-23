export const removeNullishValue = (
  arr: any[] | undefined, // Array to be filtered (now accepts undefined)
  propertiesName: string[] // Fields to check for falsy values
): any[] => {
  // Return empty array if arr is undefined or null
  if (!arr) return [];
  
  return arr.filter(item => {
    // Skip if item is null or undefined
    if (item == null) return false;
    
    // Check all required properties
    return propertiesName.every(property => {
      // Safely access the property
      const value = item[property];
      return value != null && value !== '';
    });
  });
};
