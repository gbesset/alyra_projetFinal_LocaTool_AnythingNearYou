
import React from 'react';
import { Heading, Box, Flex, Link, Image, Text, Button, Stack, Divider, ButtonGroup } from '@chakra-ui/react';
import { Card, CardHeader, CardBody, CardFooter } from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom';

export const  RentalItem= ({rental}) => {
  let navigate = useNavigate();
  const { rentalID, title, description, tokenImgURI, dayPrice, caution , rentalStatus, renter, start, end, rentalData} = rental;
  
  const handleManage = () => {
    navigate(`/app/reservation/${rental.rentalID}`, { state: { rental } });
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
           
            <Text as="h4" fontWeight="bold" textDecor="underline">Description</Text>
            <Text whiteSpace="pre-wrap">
            {description.slice(0,130) + "\n..."}
            </Text>
          </Stack>
        </CardBody>
        <Divider />
        <CardFooter justify="center">
          <Button variant='solid' colorScheme='blue' onClick={handleManage}>
            Détails
          </Button>
        </CardFooter>
      </Card>
    </Box>
  );
}
