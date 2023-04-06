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

export function isImageValid(file) {
  const allowedExtensions = ["jpg", "jpeg", "png"];
  const fileSize = file.size / 1024 / 1024; // convert to MB
  const extension = getFileExtension(file.name);
  const isExtensionAllowed = allowedExtensions.includes(extension);
  const isSizeValid = fileSize < 5; // check if file size is less than 5 MB

  return isExtensionAllowed && isSizeValid;
}

function getFileExtension(filename) {
  return filename.split(".").pop();
}