import React, { useEffect } from 'react';
import User from './src/models/User'
import { View, Text } from 'react-native'

export default function App() {

  useEffect(() => {
      (async () => {
          console.clear()
          const props = {
              name: 'Kelvin Cluxnei',
              active: true,
              weight: 30,
              age: 20,
              role_id: 1,
              extra_info: {top: true}
          }
          await User.create(props)
          console.log('User created')
          console.log('Number of users before delete:', await User.query().count())
          console.log(await User.query().where('name', 'like', '%kelvin%').destroy())
          console.log('Number of users after delete:', await User.query().count())
      })()

  }, [])
  return (
    <View style={{ backgroundColor: 'black', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
      <Text style={{ color: 'white', fontSize: 30 }}>Oi</Text>
    </View>
  );
}