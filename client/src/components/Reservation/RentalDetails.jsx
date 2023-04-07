
import React from 'react';
import { Heading, Box,  Image, Text, Button, Stack, Divider, ButtonGroup } from '@chakra-ui/react';
import { Card,  CardBody, CardFooter } from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom';


export const  RentalDetails= ({rental}) => {
  let navigate = useNavigate();
  const { rentalID, title, description, tokenImgURI, dayPrice, caution , rentalStatus, renter, start, end, rentalData} = rental;
  

  const handleManage = () => {
    navigate(`/app/reservation/${rental.rentalID}`, { state: { rental } });
  };

  return (<>
            <Card
            direction={{ base: 'column', sm: 'row' }}
            overflow='hidden'
            variant='outline'
          >
            <Image src={tokenImgURI} borderRadius='lg' objectFit='cover'
              maxW={{ base: '100%', sm: '200px' }} alt="Photo du produit"/>

            <Stack>
              <CardBody>
                <Heading size='md'>{title}</Heading>
                <Box pl="2rem">
                  <Text py='2' whiteSpace="pre-wrap">
                    {description}
                  </Text>
                
              </Box>
              </CardBody>

              <CardFooter>
                
                  <Text color='blue.600' fontSize='2xl' mr="5rem">
                    Prix/jour: {dayPrice}
                  </Text>
                  <Text color='blue.600' fontSize='2xl'>
                    Caution: {caution}
                  </Text>
             
              </CardFooter>
            </Stack>
          </Card>
    </>
  );
}
