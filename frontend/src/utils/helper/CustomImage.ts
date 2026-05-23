// import Image from '@tiptap/extension-image'
// import { mergeAttributes } from '@tiptap/core'

// export const CustomImage = Image.extend({
//   addAttributes() {
//     return {
//       ...this.parent?.(),
//       width: {
//         default: '100%',
//         parseHTML: element => element.getAttribute('data-width') || '100%',
//         renderHTML: attributes => {
//           return {
//             'data-width': attributes.width
//           }
//         }
//       },
//       align: {
//         default: null,
//         parseHTML: element => element.getAttribute('data-align'),
//         renderHTML: attributes => {
//           return {
//             'data-align': attributes.align
//           }
//         },
//       },
//     }
//   },

//   renderHTML({ HTMLAttributes }) {
//     const { align, width, ...rest } = HTMLAttributes
    
//     // Calculate styles based on alignment and width
//     let style = ''
    
//     // Handle alignment
//     if (align === 'left') {
//       style += 'float: left; margin-right: 1em;'
//     } else if (align === 'right') {
//       style += 'float: right; margin-left: 1em;'
//     } else if (align === 'center') {
//       style += 'display: block; margin: 0 auto;'
//     }
    
//     // Handle width
//     if (width) {
//       style += `width: ${width};`
//     }
    
//     return ['img', mergeAttributes(rest, { 
//       style,
//       'data-align': align || null,
//       'data-width': width || null
//     })]
//   },
// })