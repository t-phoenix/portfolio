export const CustomScrollbarStyles = () => {
  return (
    <style>{`
      .custom-scrollbar {
        scrollbar-width: thin;
        scrollbar-color: rgba(244, 108, 56, 0.6) rgba(255, 255, 255, 0.05);
      }
      
      .custom-scrollbar::-webkit-scrollbar {
        width: 8px;
      }
      
      .custom-scrollbar::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 4px;
        margin: 4px 0;
      }
      
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: rgba(244, 108, 56, 0.6);
        border-radius: 4px;
        border: 2px solid transparent;
        background-clip: padding-box;
      }
      
      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: rgba(244, 108, 56, 0.8);
        border: 2px solid transparent;
        background-clip: padding-box;
      }
      
      .custom-scrollbar::-webkit-scrollbar-thumb:active {
        background: rgba(244, 108, 56, 1);
      }
    `}</style>
  );
};
