using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BGClima.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RemoveSeoAndMetaFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "SeoDescription",
                schema: "bgclima",
                table: "Product");

            migrationBuilder.DropColumn(
                name: "SeoKeywords",
                schema: "bgclima",
                table: "Product");

            migrationBuilder.DropColumn(
                name: "SeoTitle",
                schema: "bgclima",
                table: "Product");

            migrationBuilder.DropColumn(
                name: "meta_description",
                schema: "bgclima",
                table: "Product");

            migrationBuilder.DropColumn(
                name: "meta_keywords",
                schema: "bgclima",
                table: "Product");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "SeoDescription",
                schema: "bgclima",
                table: "Product",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "SeoKeywords",
                schema: "bgclima",
                table: "Product",
                type: "character varying(500)",
                maxLength: 500,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "SeoTitle",
                schema: "bgclima",
                table: "Product",
                type: "character varying(255)",
                maxLength: 255,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "meta_description",
                schema: "bgclima",
                table: "Product",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "meta_keywords",
                schema: "bgclima",
                table: "Product",
                type: "text",
                nullable: false,
                defaultValue: "");
        }
    }
}
