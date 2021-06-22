export const applyDrag = (arr, dragResult) => {
  const { removedIndex, addedIndex, payload } = dragResult
  if (removedIndex === null && addedIndex === null) return arr

  const result = [...arr]
  let itemToAdd = payload

  if (removedIndex !== null) {
    itemToAdd = result.splice(removedIndex, 1)[0]
  }

  if (addedIndex !== null) {
    result.splice(addedIndex, 0, itemToAdd)
  }

  return result
}


export const dependencies ={
  departments:[
    {
      id: '1',
      name: 'Department-1',
      statuses:[
      ]
    },
    {
      id: '2',
      name: 'Department-2',
      statuses:[
      ]
    }
  ],
    pipelines:[
    {
      id: '1',
      name: 'Pipeline-1',
      statuses:[
        {id: 1, name: 'Status-11'},
        {id: 2, name: 'Status-12'},
        {id: 3, name: 'Status-13'},
        {id: 4, name: 'Status-14'},
      ]
    },
    {
      id: '2',
      name: 'Pipeline-2',
      statuses:[
        {id: 21, name: 'Status-21'},
        {id: 22, name: 'Status-22'},
        {id: 23, name: 'Status-23'},
        {id: 24, name: 'Status-24'},
      ]
    }
  ]
}
