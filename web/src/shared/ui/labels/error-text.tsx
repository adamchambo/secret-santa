export default function ErrorText({ text }: { text: string }) {
  return (
    <p className="text-red-500 text-sm text-center">
      {text}
    </p>
  );
}