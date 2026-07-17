import fs from 'fs';
let content = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

// 1. Fix the required attribute
content = content.replace(
  'type="text"\n                        required\n                        placeholder="Paste direct Unsplash image link..."',
  'type="text"\n                        required={!itemImage || !itemImage.startsWith(\'data:\')}\n                        placeholder="Paste direct Unsplash image link..."'
);

// 2. Add compression to file reader
const originalReader = `onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                if (typeof reader.result === 'string') {
                                  setItemImage(reader.result);
                                }
                              };
                              reader.readAsDataURL(file);
                            }
                          }}`;

const newReader = `onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                if (typeof reader.result === 'string') {
                                  const img = new window.Image();
                                  img.onload = () => {
                                    const canvas = document.createElement('canvas');
                                    let { width, height } = img;
                                    const maxSize = 800;
                                    if (width > height && width > maxSize) {
                                      height = Math.round((height * maxSize) / width);
                                      width = maxSize;
                                    } else if (height > maxSize) {
                                      width = Math.round((width * maxSize) / height);
                                      height = maxSize;
                                    }
                                    canvas.width = width;
                                    canvas.height = height;
                                    const ctx = canvas.getContext('2d');
                                    ctx?.drawImage(img, 0, 0, width, height);
                                    setItemImage(canvas.toDataURL('image/jpeg', 0.8));
                                  };
                                  img.src = reader.result;
                                }
                              };
                              reader.readAsDataURL(file);
                            }
                          }}`;

content = content.replace(originalReader, newReader);

fs.writeFileSync('src/components/AdminPanel.tsx', content);
