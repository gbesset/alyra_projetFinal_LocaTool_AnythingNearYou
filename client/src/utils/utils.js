import { createStandaloneToast } from '@chakra-ui/toast'

const { toast } = createStandaloneToast()

export function toastInfo(message) {
  toast({
    title: message,
    status: "success",
    duration: 3000,
    isClosable: true,
  });
}

export function toastError(message) {
  toast({
    title: message,
    status: "error",
    duration: 3000,
    isClosable: true,
  });
}

