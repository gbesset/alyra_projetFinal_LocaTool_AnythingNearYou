
import React from 'react';
import { Heading, Box, Link, Image, Text, Button, Stack, Divider, ButtonGroup } from '@chakra-ui/react';
import { Card, CardHeader, CardBody, CardFooter } from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom';

export const  CollectionListItem= ({tool}) => {
  let navigate = useNavigate();
  const { tokenID, serialID, title, description, tokenURI } = tool;
  
  const handleManage = () => {
    navigate(`/app/reservation/${tool.tokenID}`, { state: { tool } });
  };

  return (
    <Box borderWidth="1px" borderRadius="lg" overflow="hidden" m={4} >
    <Card maxW='sm'>
        <CardBody>
        <Image src="https://via.placeholder.com/250" borderRadius='lg'/>

          <Stack mt='6' spacing='3'>
            <Heading size='md'>{title}</Heading>
            <Text>
              tokenid: {tokenID}
            </Text>
            <Text>
            {description}
            </Text>
            <Text color='blue.600' fontSize='2xl'>
              $450
            </Text>
          </Stack>
        </CardBody>
        <Divider />
        <CardFooter>
          <ButtonGroup spacing='2'>
            <Button variant='solid' colorScheme='blue' onClick={handleManage}>
              Réserver
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
