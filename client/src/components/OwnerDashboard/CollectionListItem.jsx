
import React from 'react';
import { Heading, Box, Flex, Link, Image, Text, Button, Stack, Divider, ButtonGroup } from '@chakra-ui/react';
import { Card, CardHeader, CardBody, CardFooter } from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom';

export const  CollectionListItem= ({rental}) => {
  let navigate = useNavigate();
  const { tokenID, serialID, title, description, tokenImgURI, tokenURI, dayPrice, caution } = rental;
  
  const handleManage = () => {
    navigate(`/app/reservation/${rental.tokenID}`, { state: { rental } });
  };

  return (
    <Box borderWidth="1px" borderRadius="lg" overflow="hidden" m={4} mx="auto">
    <Card maxW='sm' >
        <CardBody>
        <Image src={tokenImgURI} borderRadius='lg' maxHeight="200px"/>

          <Stack mt='6' spacing='3'>
            <Heading size='md'>{title}</Heading>
           
            <Flex justify='space-between'>
                <Text color='blue.600' fontSize='2xl'>
                  Prix/jour: {dayPrice}
                </Text>
                <Text color='blue.600' fontSize='2xl'>
                  Caution: {caution}
                </Text>
            </Flex>
           
            <Text>
              tokenid: {tokenID}
            </Text>
            <Text as="h4" fontWeight="bold" textDecor="underline">Description</Text>
            <Text whiteSpace="pre-wrap">
            {description.slice(0,130) + "\n..."}
            </Text>
          </Stack>
        </CardBody>
        <Divider />
        <CardFooter>
          <ButtonGroup spacing='2'>
            <Button variant='solid' colorScheme='blue' onClick={handleManage}>
              Suivre
            </Button>
            <Link href={tokenURI} isExternal>
            <Button variant='ghost' colorScheme='blue'>
              plus d'info
            </Button>
            </Link>
          </ButtonGroup>
        </CardFooter>
      </Card>
    </Box>
  );
}
