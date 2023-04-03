
import { BrowserRouter } from "react-router-dom";
import { ChakraProvider } from '@chakra-ui/react'
import { AppRouter } from "./routes/AppRouter";

function App() {
  return (
    <ChakraProvider>
        <BrowserRouter>
              <AppRouter/>          
        </BrowserRouter>
    </ChakraProvider>
  );
}

export default App;
