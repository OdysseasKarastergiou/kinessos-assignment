export type User = {
    id: string;
    email: string;
    password: string;
  };

export type Business = {
    id: number
    name: string
    location: string
    type: 'bar' | 'restaurant' | 'club' | 'hotel' | 'cafe';
  };
 
export type Staff = {
    id: number
    email: string
    firstName: string
    lastName: string
    position: string
    businessId: number
  };
  
export type Props = {
    params: {
      id: string;
    };
  };