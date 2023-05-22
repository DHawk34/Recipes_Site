export const toBase64 = (file: File) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

export const addMeta = (name: string, content: string) => {
  let meta = document.querySelector(`meta[name = "${name}"`) as HTMLMetaElement;

  if (!meta)
    meta = (document.createElement('meta') as HTMLMetaElement);

  meta.name = name;
  meta.content = content;
  document.head.appendChild(meta);
}