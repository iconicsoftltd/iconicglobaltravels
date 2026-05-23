export const removeFalsyValuesProperties = (
  selectedObject: any,
  propertiesName: string[]
) => {
  return Object.fromEntries(
    Object.entries(selectedObject)?.filter(([key, value]) => {
      return (
        !propertiesName.includes(key) ||
        (value !== "" && value !== 0 && value !== null)
      );
    })
  );
};



// export function validateEmptyFields<T extends Record<string, unknown>>(obj: T): Partial<T> {
//     const validatedObj: Partial<T> = {};

//     for (const key in obj) {
//         if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;
        
//         const value = obj[key];
        
//         // Skip if value is null or undefined
//         if (value === null || value === undefined) {
//             continue;
//         }

//         // Handle numeric fields (excluding nid)
//         if ((key === 'classRoll' || /(Id|id|Number|number)$/.test(key)) && key !== 'nid') {
//             if (typeof value === 'string' && value.trim() !== '') {
//                 const numValue = Number(value);
//                 if (!isNaN(numValue)) {
//                     validatedObj[key as keyof T] = numValue as unknown as T[keyof T];
//                 }
//                 continue;
//             }
//             if (typeof value === 'number') {
//                 validatedObj[key as keyof T] = value as unknown as T[keyof T];
//                 continue;
//             }
//         }

//         // Handle string fields
//         if (typeof value === 'string') {
//             if (value.trim() !== '') {
//                 validatedObj[key as keyof T] = value as unknown as T[keyof T];
//             }
//             continue;
//         }

//         // Handle all other non-null, non-undefined values
//         validatedObj[key as keyof T] = value as unknown as T[keyof T];
//     }

//     return validatedObj;
// }