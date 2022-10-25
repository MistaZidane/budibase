import {
  Integration,
  DatasourceFieldType,
  QueryType,
  IntegrationBase,
} from "@budibase/types"

const { Client } = require("@elastic/elasticsearch")

interface ElasticsearchConfig {
  url: string
  ssl?: boolean
  ca?: string
  rejectUnauthorized?: boolean
}

const SCHEMA: Integration = {
  docs: "https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/index.html",
  description:
    "Elasticsearch is a search engine based on the Lucene library. It provides a distributed, multitenant-capable full-text search engine with an HTTP web interface and schema-free JSON documents.",
  friendlyName: "ElasticSearch",
  type: "Non-relational",
  datasource: {
    url: {
      type: DatasourceFieldType.STRING,
      required: true,
      default: "http://localhost:9200",
    },
    ssl: {
      type: DatasourceFieldType.BOOLEAN,
      default: false,
      required: false,
    },
    rejectUnauthorized: {
      type: DatasourceFieldType.BOOLEAN,
      default: true,
      required: false,
    },
    ca: {
      type: DatasourceFieldType.LONGFORM,
      default: false,
      required: false,
    },
  },
  query: {
    create: {
      type: QueryType.FIELDS,
      customisable: true,
      fields: {
        index: {
          type: DatasourceFieldType.STRING,
          required: true,
        },
      },
    },
    read: {
      type: QueryType.FIELDS,
      customisable: true,
      fields: {
        index: {
          type: DatasourceFieldType.STRING,
          required: true,
        },
      },
    },
    update: {
      type: QueryType.FIELDS,
      customisable: true,
      fields: {
        id: {
          type: DatasourceFieldType.STRING,
          required: true,
        },
        index: {
          type: DatasourceFieldType.STRING,
          required: true,
        },
      },
    },
    delete: {
      type: QueryType.FIELDS,
      fields: {
        index: {
          type: DatasourceFieldType.STRING,
          required: true,
        },
        id: {
          type: DatasourceFieldType.STRING,
          required: true,
        },
      },
    },
  },
}

class ElasticSearchIntegration implements IntegrationBase {
  private config: ElasticsearchConfig
  private client: any

  constructor(config: ElasticsearchConfig) {
    this.config = config

    let newConfig = { 
      node: this.config.url,
      ssl: this.config.ssl 
        ? {
          rejectUnauthorized: this.config.rejectUnauthorized,
          ca: this.config.ca ? this.config.ca : undefined
        }
        : undefined,
    }

    if (newConfig.ssl && !newConfig.ssl.ca)
    {
      delete newConfig.ssl.ca
    } else if(!newConfig.ssl)
    {
      delete newConfig.ssl
    }
    this.client = new Client(newConfig)
  }

  async create(query: { index: string; json: object }) {
    const { index, json } = query

    try {
      const result = await this.client.index({
        index,
        body: json,
      })
      return result.body
    } catch (err) {
      console.error("Error writing to elasticsearch", err)
      throw err
    } finally {
      await this.client.close()
    }
  }

  async read(query: { index: string; json: object }) {
    const { index, json } = query
    try {
      const result = await this.client.search({
        index: index,
        body: json,
      })
      return result.body.hits.hits.map(({ _source }: any) => _source)
    } catch (err) {
      console.error("Error querying elasticsearch", err)
      throw err
    } finally {
      await this.client.close()
    }
  }

  async update(query: { id: string; index: string; json: object }) {
    const { id, index, json } = query
    try {
      const result = await this.client.update({
        id,
        index,
        body: json,
      })
      return result.body
    } catch (err) {
      console.error("Error querying elasticsearch", err)
      throw err
    } finally {
      await this.client.close()
    }
  }

  async delete(query: object) {
    try {
      const result = await this.client.delete(query)
      return result.body
    } catch (err) {
      console.error("Error deleting from elasticsearch", err)
      throw err
    } finally {
      await this.client.close()
    }
  }
}

export default {
  schema: SCHEMA,
  integration: ElasticSearchIntegration,
}
