import React, { useEffect } from 'react';
import User from './src/models/User'
import { View, Text } from 'react-native'

export default function App() {

  useEffect(() => {
      (async () => {
          console.clear()
          const a = User.query()
              .where('name', '=', 'kelvin')
              .orWhere('age', '>', 10)
              .orWhere((q) =>
                  q.where('active', '=', true)
                  .where('role_id', '=', 3)
                  .where((q) =>
                      q.where('age', '!=', 3)
                          .orWhere('age', 'is', 'odd')
                  )
              )
              .orWhereNull('name')
              .where((q) =>
                  q.whereNull('name')
                  .orWhereNotNull('name')
                  .whereNotNull('name')
              )
              .whereIn('name', ['kelvin', 'cluxnei'])
              .whereNotIn('name', ['cluxnei', 'kelvin'])
              .orWhereIn('name', [1, 2, 3])
              .orWhereNotIn('name', [3, 2, 1])
              .whereRaw('AEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE')
              .orWhereRaw('TOPEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEe')
          a.debugSqlLogs = true
          console.log(await a.toSql())
      })()

  }, [])
  return (
    <View style={{ backgroundColor: 'black', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
      <Text style={{ color: 'white', fontSize: 30 }}>Oi</Text>
    </View>
  );
}