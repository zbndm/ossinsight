module SchemaDumpingHelper
  def dump_table_schema(table, connection = ActiveRecord::Base.connection)
    old_ignore_tables = ActiveRecord::SchemaDumper.ignore_tables
    ActiveRecord::SchemaDumper.ignore_tables = connection.data_sources - [table]
    stream = StringIO.new
    ActiveRecord::SchemaDumper.dump(ActiveRecord::Base.connection, stream)
    stream.string
  ensure
    ActiveRecord::SchemaDumper.ignore_tables = old_ignore_tables
  end
end