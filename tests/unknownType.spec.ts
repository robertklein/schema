import { Kind } from 'graphql'
import { makeSchema, makeSchemaInternal, objectType, UNKNOWN_TYPE_SCALAR } from '../src/core'

describe('unknownType', () => {
  const Query = objectType({
    name: 'Query',
    definition(t) {
      t.field('user', {
        // @ts-ignore
        type: User,
        resolve(root, args, ctx) {
          return { id: 'test', name: 'test' }
        },
      })

      // Won't work
      t.field('user2', {
        // @ts-ignore
        type: 'User',
        resolve(root, args, ctx) {
          return { id: 'test', name: 'test' }
        },
      })
    },
  })

  const User = objectType({
    name: 'CustomUserName',
    definition(t) {
      t.id('id')
      t.string('name')
    },
  })

  test('schema should build without throwing', () => {
    expect(() => {
      makeSchemaInternal({
        types: [Query, User],
        outputs: { typegen: false, schema: false },
      })
    }).not.toThrowError()
  })

  test('there should be some missing types', () => {
    const { missingTypes } = makeSchemaInternal({
      types: [Query, User],
      outputs: { schema: false, typegen: false },
    })

    expect(Object.keys(missingTypes).length).toEqual(1)
    expect(Object.keys(missingTypes)).toContain('User')
  })

  test('should render the typegen but throw', () => {
    try {
      makeSchema({
        types: [Query, User],
        outputs: {
          schema: false,
          typegen: false,
        },
        shouldGenerateArtifacts: true,
      })
    } catch (e) {
      expect(e).toMatchSnapshot()
    }
  })

  test('UNKNOWN_TYPE_SCALAR is a scalar, with identity for the implementation', () => {
    const obj = {}
    expect(() => {
      UNKNOWN_TYPE_SCALAR.parseLiteral({ value: '123.45', kind: Kind.FLOAT }, {})
    }).toThrowError('Error: NEXUS__UNKNOWN__TYPE is not a valid scalar.')
    expect(() => UNKNOWN_TYPE_SCALAR.parseValue(obj)).toThrowError(
      'Error: NEXUS__UNKNOWN__TYPE is not a valid scalar.'
    )
    expect(() => UNKNOWN_TYPE_SCALAR.serialize(obj)).toThrowError(
      'Error: NEXUS__UNKNOWN__TYPE is not a valid scalar.'
    )
  })
})
